import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface QuantumInvoice {
  id: string;
  type: string;
  seriesAndNumber: string;
  invoiceDate: string;
  customerProviderId: string;
  name: string;
  totalAmountWithoutTaxes: string;
  totalAmount: string;
  line: Array<{
    description: string;
    quantity: string;
    amount: string;
    base: string;
    reference?: string;
    referenceType?: string;
  }>;
}

interface QuantumResponse {
  error: {
    message: string;
    errorCode: string;
  };
  invoices: QuantumInvoice[];
  income?: string;
  expenses?: string;
  balance?: string;
  invoicesQuantity?: string;
}

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧾 [Quantum Invoices Sync] Iniciando sincronización');

    // Inicializar cliente Supabase con service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener credenciales de Quantum (usar valor fijo como en contactos)
    const quantumToken = Deno.env.get('quantum_api_token');
    const quantumCompanyId = '28171';

    console.log('🔍 [Config] Verificando credenciales...');
    console.log(`🏢 [Config] Company ID: ${quantumCompanyId ? `***${quantumCompanyId.slice(-4)}` : 'NO CONFIGURADO'}`);
    console.log(`🔑 [Config] Token: ${quantumToken ? `***${quantumToken.slice(-8)}` : 'NO CONFIGURADO'}`);

    if (!quantumToken || !quantumCompanyId) {
      console.error('❌ [Error] Credenciales de Quantum no configuradas');
      return new Response(
        JSON.stringify({ 
          error: 'Credenciales de Quantum no configuradas. Verifica quantum_api_token y quantum_company_id.',
          config_status: {
            token_configured: !!quantumToken,
            company_id_configured: !!quantumCompanyId
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Obtener parámetros de la request
    const { org_id, start_date, end_date } = await req.json();
    
    if (!org_id) {
      return new Response(
        JSON.stringify({ error: 'org_id es requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Crear registro de sincronización
    const { data: syncRecord, error: syncError } = await supabase
      .from('quantum_invoice_sync_history')
      .insert({
        org_id,
        sync_status: 'in_progress',
        sync_type: 'manual',
        start_date,
        end_date
      })
      .select()
      .single();

    if (syncError) {
      console.error('❌ [Error] Error al crear registro de sincronización:', syncError);
      return new Response(
        JSON.stringify({ error: 'Error al iniciar sincronización' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📝 [Sync] Registro de sincronización creado:', syncRecord.id);

    // Construir URL de la API de Quantum (formato corregido)
    let apiUrl = `https://app.quantumeconomics.es/contabilidad/ws/invoice?type=C&companyId=${quantumCompanyId}`;
    
    // Solo agregar fechas si están presentes
    if (start_date) {
      // Mantener formato ISO para start_date
      apiUrl += `&startDate=${start_date}`;
    }
    if (end_date) {
      // Mantener formato ISO para end_date
      apiUrl += `&endDate=${end_date}`;
    }

    console.log('🌐 [API] Llamando a Quantum API:', apiUrl);
    console.log('🔑 [Auth] Probando autenticación con token...');

    // Usar el mismo orden de autenticación que funciona en contactos
    const authFormats = [
      { name: 'Bearer', header: `Bearer ${quantumToken}` },
      { name: 'API-KEY', header: `API-KEY ${quantumToken}` }
    ];

    let response;
    let authUsed = '';
    let lastError = '';

    for (const authFormat of authFormats) {
      try {
        console.log(`🔐 [Auth] Probando formato: ${authFormat.name}`);
        
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': authFormat.header,
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0'
          }
        });

        console.log(`📡 [Response] Status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          authUsed = authFormat.name;
          console.log(`✅ [Auth] Éxito con formato: ${authFormat.name}`);
          break;
        } else {
          // Leer el error pero continuar probando
          const errorText = await response.text();
          lastError = `${authFormat.name}: ${response.status} - ${errorText.substring(0, 200)}`;
          console.log(`❌ [Auth] Fallo con ${authFormat.name}: ${response.status}`);
        }
      } catch (error) {
        lastError = `${authFormat.name}: ${error.message}`;
        console.log(`❌ [Auth] Error con ${authFormat.name}: ${error.message}`);
      }
    }

    if (!response || !response.ok) {
      console.error('❌ [Quantum API] Todos los formatos de autenticación fallaron');
      console.error('❌ [Details] Último error:', lastError);
      
      await supabase
        .from('quantum_invoice_sync_history')
        .update({
          sync_status: 'error',
          error_details: { 
            api_error: lastError, 
            url: apiUrl,
            company_id: quantumCompanyId,
            auth_formats_tried: authFormats.map(f => f.name)
          }
        })
        .eq('id', syncRecord.id);

      return new Response(
        JSON.stringify({ 
          error: 'Todos los formatos de autenticación fallaron',
          details: lastError,
          url: apiUrl,
          company_id: quantumCompanyId
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🎯 [Success] Autenticación exitosa con: ${authUsed}`);

    // Validar que la respuesta sea JSON válido
    let quantumData: QuantumResponse;
    try {
      const responseText = await response.text();
      console.log('📄 [Response] Primeros 500 caracteres:', responseText.substring(0, 500));
      
      // Verificar si es HTML (error común)
      if (responseText.trim().startsWith('<')) {
        throw new Error('La API devolvió HTML en lugar de JSON. Posible página de error.');
      }
      
      quantumData = JSON.parse(responseText);
      console.log('📊 [JSON] Respuesta parseada exitosamente');
      
    } catch (parseError) {
      console.error('❌ [JSON] Error parseando respuesta:', parseError.message);
      
      await supabase
        .from('quantum_invoice_sync_history')
        .update({
          sync_status: 'error',
          error_details: { 
            parse_error: parseError.message,
            auth_used: authUsed,
            url: apiUrl
          }
        })
        .eq('id', syncRecord.id);

      return new Response(
        JSON.stringify({ 
          error: 'Respuesta inválida de la API de Quantum',
          details: parseError.message,
          auth_used: authUsed
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar si hay error en la respuesta - errorCode "0" significa éxito (como en contactos)
    if (quantumData.error && quantumData.error.errorCode && quantumData.error.errorCode !== '0') {
      console.error('❌ [Quantum API] Error en respuesta:', quantumData.error);
      
      await supabase
        .from('quantum_invoice_sync_history')
        .update({
          sync_status: 'error',
          error_details: { quantum_error: quantumData.error }
        })
        .eq('id', syncRecord.id);

      return new Response(
        JSON.stringify({ 
          error: 'Error en respuesta de Quantum',
          details: quantumData.error 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log para debug: mostrar error con código 0 (éxito)
    if (quantumData.error && quantumData.error.errorCode === '0') {
      console.log('✅ [Success] Respuesta exitosa de Quantum API:', quantumData.error.message, '(Código:', quantumData.error.errorCode + ')');
    }

    console.log(`📊 [Data] Facturas recibidas: ${quantumData.invoices?.length || 0}`);

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors: any[] = [];

    // Procesar cada factura
    for (const invoice of quantumData.invoices || []) {
      try {
        processedCount++;

        // Buscar cliente por quantum_customer_id
        const { data: contact } = await supabase
          .from('contacts')
          .select('id')
          .eq('quantum_customer_id', invoice.customerProviderId)
          .eq('org_id', org_id)
          .single();

        // Preparar datos de la factura
        const invoiceData = {
          quantum_invoice_id: invoice.id,
          org_id,
          contact_id: contact?.id || null,
          quantum_customer_id: invoice.customerProviderId,
          client_name: invoice.name,
          series_and_number: invoice.seriesAndNumber,
          invoice_date: invoice.invoiceDate,
          total_amount_without_taxes: parseFloat(invoice.totalAmountWithoutTaxes) || 0,
          total_amount: parseFloat(invoice.totalAmount) || 0,
          invoice_lines: invoice.line || [],
          quantum_data: invoice
        };

        // Intentar insertar o actualizar
        const { data: existingInvoice } = await supabase
          .from('quantum_invoices')
          .select('id')
          .eq('quantum_invoice_id', invoice.id)
          .eq('org_id', org_id)
          .single();

        if (existingInvoice) {
          // Actualizar factura existente
          const { error: updateError } = await supabase
            .from('quantum_invoices')
            .update(invoiceData)
            .eq('id', existingInvoice.id);

          if (updateError) {
            console.error('❌ [Update] Error actualizando factura:', updateError);
            errors.push({ invoice_id: invoice.id, error: updateError });
          } else {
            updatedCount++;
          }
        } else {
          // Crear nueva factura
          const { error: insertError } = await supabase
            .from('quantum_invoices')
            .insert(invoiceData);

          if (insertError) {
            console.error('❌ [Insert] Error insertando factura:', insertError);
            errors.push({ invoice_id: invoice.id, error: insertError });
          } else {
            createdCount++;
          }
        }

      } catch (error) {
        console.error('❌ [Process] Error procesando factura:', error);
        errors.push({ invoice_id: invoice.id, error: error.message });
      }
    }

    // Actualizar registro de sincronización
    const finalStatus = errors.length === 0 ? 'success' : 'error';
    await supabase
      .from('quantum_invoice_sync_history')
      .update({
        sync_status: finalStatus,
        invoices_processed: processedCount,
        invoices_created: createdCount,
        invoices_updated: updatedCount,
        error_details: errors.length > 0 ? { errors } : null
      })
      .eq('id', syncRecord.id);

    console.log(`✅ [Complete] Sincronización completada: ${createdCount} creadas, ${updatedCount} actualizadas, ${errors.length} errores`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sincronización completada',
        summary: {
          processed: processedCount,
          created: createdCount,
          updated: updatedCount,
          errors: errors.length
        },
        sync_id: syncRecord.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [General] Error general:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});