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

    // Procesar y guardar cada cliente con UPSERT para evitar duplicados
    let registrosProcesados = 0;
    let registrosActualizados = 0;
    let registrosNuevos = 0;
    const errores: string[] = [];
    
    console.log(`💾 Procesando ${customers.length} clientes con prevención de duplicados...`);

    for (const customer of customers) {
      try {
        if (!customer.id || !customer.name) {
          console.warn('⚠️ Cliente con datos incompletos:', customer);
          errores.push(`Cliente con ID o nombre vacío: ${JSON.stringify(customer)}`);
          continue;
        }

        // Verificar si ya existe por quantum_customer_id para evitar duplicados
        const { data: existingCustomer } = await supabase
          .from('contacts')
          .select('id, updated_at')
          .eq('quantum_customer_id', customer.id)
          .eq('client_type', 'empresa')
          .eq('source', 'quantum_auto')
          .single();

        const customerData = {
          quantum_customer_id: customer.id,
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          address_street: customer.address || null,
          dni_nif: customer.nif || null,
          business_sector: customer.sector || null,
          client_type: 'empresa',
          source: 'quantum_auto',
          relationship_type: 'cliente',
          status: 'activo',
          // Solo setear org_id si es un nuevo registro
          ...(existingCustomer ? {} : { org_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }) // TODO: Obtener org_id dinámicamente
        };

        if (existingCustomer) {
          // Actualizar registro existente
          const { error } = await supabase
            .from('contacts')
            .update(customerData)
            .eq('id', existingCustomer.id);

          if (error) {
            console.error('❌ Error al actualizar cliente:', customer.id, error);
            errores.push(`Error actualizando cliente ${customer.id}: ${error.message}`);
          } else {
            registrosActualizados++;
            console.log('🔄 Cliente actualizado:', customer.id, customer.name);
          }
        } else {
          // Crear nuevo registro
          const { error } = await supabase
            .from('contacts')
            .insert(customerData);

          if (error) {
            console.error('❌ Error al crear cliente:', customer.id, error);
            errores.push(`Error creando cliente ${customer.id}: ${error.message}`);
          } else {
            registrosNuevos++;
            console.log('✅ Cliente creado:', customer.id, customer.name);
          }
        }
        
        registrosProcesados++;
      } catch (err) {
        console.error('❌ Error al procesar cliente:', customer.id, err);
        errores.push(`Error procesando cliente ${customer.id}: ${err.message}`);
      }
    }

    const syncResult = {
      success: errores.length === 0,
      message: `Sincronización completada. Procesados: ${registrosProcesados}, Nuevos: ${registrosNuevos}, Actualizados: ${registrosActualizados}${errores.length > 0 ? `, Errores: ${errores.length}` : ''}`,
      data: {
        processed: registrosProcesados,
        new: registrosNuevos,
        updated: registrosActualizados,
        errors: errores.length,
        total: customers.length
      }
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