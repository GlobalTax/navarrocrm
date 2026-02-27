import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface QuantumCustomer {
  regid: string;
  customerId: string;
  name: string;
  nif?: string;
  email?: string;
  phone?: string;
  countryISO?: string;
  streetType?: string;
  streetName?: string;
  streetNumber?: string;
  postCode?: string;
  cityCode?: string;
  [key: string]: any;
}

interface QuantumCustomersResponse {
  error?: { message: string; errorCode: string };
  customers?: QuantumCustomer[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando sincronización de clientes Quantum con prevención de duplicados');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase incompleta');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const quantumToken = Deno.env.get('quantum_api_token');
    const companyId = Deno.env.get('quantum_company_id');
    
    console.log(`🏢 Company ID: ${companyId ? `***${companyId.slice(-4)}` : 'NO CONFIGURADO'}`);
    console.log(`🔑 Token: ${quantumToken ? `***${quantumToken.slice(-8)}` : 'NO CONFIGURADO'}`);
    
    if (!quantumToken || !companyId) {
      const errorMsg = 'Credenciales de Quantum no configuradas (quantum_api_token o quantum_company_id)';
      console.error('❌', errorMsg);
      
      return new Response(
        JSON.stringify({ success: false, error: errorMsg, config_status: { token_configured: !!quantumToken, company_id_configured: !!companyId } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Llamar a la API de clientes de Quantum (endpoint singular: /customer)
    const apiUrl = `https://app.quantumeconomics.es/contabilidad/ws/customer?companyId=${companyId}`;
    console.log('📡 Llamando a API Quantum customer:', apiUrl.replace(companyId, `***${companyId.slice(-4)}`));

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${quantumToken}`,
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        }
      });

      if (!response.ok) {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `API-KEY ${quantumToken}`,
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0'
          }
        });
      }
    } catch (fetchError) {
      throw new Error(`Error de conexión con Quantum: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    }

    if (!response.ok) {
      const errorMsg = `Error en API Quantum: ${response.status} ${response.statusText}`;
      console.error('❌', errorMsg);
      
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: QuantumCustomersResponse = await response.json();
    console.log('📋 Estructura de respuesta:', Object.keys(data));

    // Verificar error en respuesta (errorCode "0" = éxito)
    if (data.error && data.error.errorCode && data.error.errorCode !== "0") {
      const errorMsg = `Error de Quantum API: ${data.error.message} (Código: ${data.error.errorCode})`;
      console.error('❌', errorMsg);
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customers = data.customers;
    if (!customers || !Array.isArray(customers)) {
      const errorMsg = 'Respuesta inválida de la API de Quantum - no se encontraron clientes';
      console.error('❌', errorMsg);

      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener org_id del primer usuario disponible (fallback)
    const { data: firstUser } = await supabase
      .from('users')
      .select('org_id')
      .limit(1)
      .single();

    const defaultOrgId = firstUser?.org_id;
    if (!defaultOrgId) {
      throw new Error('No se pudo determinar la organización destino');
    }

    // Procesar y guardar cada cliente con UPSERT mejorado para evitar duplicados
    let registrosProcesados = 0;
    let registrosActualizados = 0;
    let registrosNuevos = 0;
    let registrosOmitidos = 0;
    const errores: string[] = [];
    
    console.log(`💾 Procesando ${customers.length} clientes con prevención avanzada de duplicados...`);

    for (const customer of customers) {
      try {
        if (!customer.customerId || !customer.name?.trim()) {
          console.warn('⚠️ Cliente con datos incompletos:', customer);
          errores.push(`Cliente con customerId o nombre vacío: ${JSON.stringify(customer)}`);
          registrosOmitidos++;
          continue;
        }

        // Construir dirección completa a partir de los campos de Quantum
        const addressParts = [
          customer.streetType,
          customer.streetName,
          customer.streetNumber
        ].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(' ') : null;

        // Detectar tipo de entidad por NIF/CIF
        const nif = customer.nif?.trim() || '';
        const companyCifLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'N', 'P', 'Q', 'R', 'S', 'U', 'V', 'W'];
        const isCompany = nif.length > 0 && companyCifLetters.includes(nif.charAt(0).toUpperCase());

        const customerData = {
          quantum_customer_id: customer.customerId,
          name: customer.name.trim(),
          email: customer.email?.trim() || null,
          phone: customer.phone?.trim() || null,
          address_street: fullAddress,
          address_postal_code: customer.postCode || null,
          dni_nif: nif || null,
          client_type: isCompany ? 'empresa' : 'particular',
          source: 'quantum_auto',
          relationship_type: 'cliente',
          status: 'activo',
          org_id: defaultOrgId,
          updated_at: new Date().toISOString()
        };

        // Verificar si ya existe por quantum_customer_id
        const { data: existing } = await supabase
          .from('contacts')
          .select('id')
          .eq('org_id', defaultOrgId)
          .eq('quantum_customer_id', customer.customerId)
          .single();

        if (existing) {
          // Actualizar contacto existente
          const { error: updateError } = await supabase
            .from('contacts')
            .update(customerData)
            .eq('id', existing.id);

          if (updateError) {
            console.error('❌ Error al actualizar cliente:', customer.customerId, updateError);
            errores.push(`Error actualizando cliente ${customer.customerId}: ${updateError.message}`);
          } else {
            registrosActualizados++;
            console.log('✅ Cliente actualizado:', customer.customerId, customer.name);
          }
        } else {
          // Insertar nuevo contacto
          const { error: insertError } = await supabase
            .from('contacts')
            .insert(customerData);

          if (insertError) {
            console.error('❌ Error al insertar cliente:', customer.customerId, insertError);
            errores.push(`Error insertando cliente ${customer.customerId}: ${insertError.message}`);
          } else {
            registrosNuevos++;
            console.log('✅ Cliente nuevo importado:', customer.customerId, customer.name);
          }
        }

        registrosProcesados++;
      } catch (err) {
        console.error('❌ Error al procesar cliente:', customer.customerId, err);
        errores.push(`Error procesando cliente ${customer.customerId}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Verificar duplicados finales después de la sincronización
    const { data: finalDuplicatesCheck } = await supabase
      .from('contacts')
      .select('quantum_customer_id, name')
      .eq('org_id', defaultOrgId)
      .not('quantum_customer_id', 'is', null)
      .eq('client_type', 'empresa');

    const duplicatesFound = finalDuplicatesCheck?.reduce((acc, contact) => {
      const key = contact.quantum_customer_id!;
      if (!acc[key]) acc[key] = [];
      acc[key].push(contact.name);
      return acc;
    }, {} as Record<string, string[]>) || {};

    const duplicateGroups = Object.entries(duplicatesFound)
      .filter(([_, names]) => names.length > 1)
      .map(([quantumId, names]) => ({
        quantum_id: quantumId,
        count: names.length,
        names
      }));

    const syncResult = {
      success: errores.length === 0 && duplicateGroups.length === 0,
      message: `Sincronización completada. Procesados: ${registrosProcesados}, Nuevos: ${registrosNuevos}, Actualizados: ${registrosActualizados}, Omitidos: ${registrosOmitidos}${errores.length > 0 ? `, Errores: ${errores.length}` : ''}${duplicateGroups.length > 0 ? `, Duplicados detectados: ${duplicateGroups.length}` : ''}`,
      data: {
        processed: registrosProcesados,
        new: registrosNuevos,
        updated: registrosActualizados,
        skipped: registrosOmitidos,
        errors: errores.length,
        duplicates_detected: duplicateGroups.length,
        total: customers.length
      },
      duplicates: duplicateGroups.length > 0 ? duplicateGroups : undefined,
      error_details: errores.length > 0 ? errores.slice(0, 10) : undefined // Máximo 10 errores en respuesta
    };

    console.log('🎉', syncResult.message);

    return new Response(
      JSON.stringify(syncResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error general en sincronización:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : String(error) || 'Error interno del servidor'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});