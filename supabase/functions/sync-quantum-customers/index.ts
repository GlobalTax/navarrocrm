import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface QuantumCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  nif?: string;
  sector?: string;
}

interface QuantumCustomersResponse {
  customers?: QuantumCustomer[];
  getCustomers?: QuantumCustomer[];
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
    const companyId = '28171';
    
    if (!quantumToken) {
      const errorMsg = 'Token de Quantum Economics no configurado';
      console.error('❌', errorMsg);
      
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Llamar a la API de clientes de Quantum
    const apiUrl = `https://app.quantumeconomics.es/contabilidad/ws/customers?companyId=${companyId}`;
    console.log('📡 Llamando a API Quantum customers:', apiUrl);

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
      throw new Error(`Error de conexión con Quantum: ${fetchError.message}`);
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

    const customers = data.customers || data.getCustomers;
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
        if (!customer.id || !customer.name?.trim()) {
          console.warn('⚠️ Cliente con datos incompletos:', customer);
          errores.push(`Cliente con ID o nombre vacío: ${JSON.stringify(customer)}`);
          registrosOmitidos++;
          continue;
        }

        const customerData = {
          quantum_customer_id: customer.id,
          name: customer.name.trim(),
          email: customer.email?.trim() || null,
          phone: customer.phone?.trim() || null,
          address_street: customer.address?.trim() || null,
          dni_nif: customer.nif?.trim() || null,
          business_sector: customer.sector?.trim() || null,
          client_type: 'empresa',
          source: 'quantum_auto',
          relationship_type: 'cliente',
          status: 'activo',
          org_id: defaultOrgId,
          updated_at: new Date().toISOString()
        };

        // Usar UPSERT para manejar duplicados automáticamente
        const { error: upsertError } = await supabase
          .from('contacts')
          .upsert(customerData, { 
            onConflict: 'quantum_customer_id,org_id',
            ignoreDuplicates: false 
          });

        if (upsertError) {
          console.error('❌ Error al procesar cliente:', customer.id, upsertError);
          errores.push(`Error procesando cliente ${customer.id}: ${upsertError.message}`);
        } else {
          registrosActualizados++;
          console.log('✅ Cliente procesado:', customer.id, customer.name);
        }
        
        registrosProcesados++;
      } catch (err) {
        console.error('❌ Error al procesar cliente:', customer.id, err);
        errores.push(`Error procesando cliente ${customer.id}: ${err.message}`);
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
        error: error.message || 'Error interno del servidor'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});