import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando Edge Function sync-quantum-accounts');
    
    // 1. OBTENER SECRETOS DIRECTAMENTE
    const quantumToken = Deno.env.get('quantum_api_token');
    const companyId = Deno.env.get('quantum_company_id');
    
    console.log('🔑 Verificando secretos...');
    console.log('Token presente:', quantumToken ? 'SÍ' : 'NO');
    console.log('Company ID presente:', companyId ? 'SÍ' : 'NO');

    if (!quantumToken || !companyId) {
      const errorMsg = 'Error: No se encontraron los secretos. Verifique que "quantum_api_token" y "quantum_company_id" estén configurados en Supabase Edge Functions.';
      console.error('❌', errorMsg);
      
      // Registrar error en historial
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: errorMsg,
        records_processed: 0,
        error_details: { 
          quantum_token_present: !!quantumToken,
          company_id_present: !!companyId 
        }
      });

      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 2. CONSTRUIR URL Y LLAMAR A LA API
    const apiUrl = `https://app.quantumeconomics.es/contabilidad/ws/account?companyId=${companyId}&year=2024&accountType=C`;
    console.log('📡 Llamando a API Quantum:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `API-KEY ${quantumToken}`,
        'Accept': 'application/json'
      }
    });

    console.log('📊 Respuesta API status:', response.status);

    if (!response.ok) {
      const errorMsg = `Error en API Quantum: ${response.status} ${response.statusText}`;
      console.error('❌', errorMsg);
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: errorMsg,
        records_processed: 0,
        error_details: { 
          status: response.status,
          statusText: response.statusText 
        }
      });

      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('📋 Estructura de respuesta:', Object.keys(data));

    // 3. VERIFICAR ESTRUCTURA DE RESPUESTA
    const accounts = data.accounts || data.getaccounts;
    if (!accounts) {
      const errorMsg = 'Error: La respuesta de la API no contiene cuentas. Estructura recibida: ' + JSON.stringify(Object.keys(data));
      console.error('❌', errorMsg);
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: errorMsg,
        records_processed: 0,
        error_details: { response_structure: Object.keys(data) }
      });

      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 4. PROCESAR Y GUARDAR CUENTAS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let registrosProcesados = 0;
    console.log(`💾 Procesando ${accounts.length} cuentas...`);

    for (const cuenta of accounts) {
      try {
        const { error } = await supabase
          .from('cuentas')
          .upsert({
            id: cuenta.id,
            nombre: cuenta.name,
            balance_actual: cuenta.currentBalance,
            debito: cuenta.debit,
            credito: cuenta.credit,
            datos_completos: cuenta
          });

        if (error) {
          console.error('❌ Error al guardar cuenta:', cuenta.id, error);
        } else {
          registrosProcesados++;
          console.log('✅ Cuenta guardada:', cuenta.id, cuenta.name);
        }
      } catch (err) {
        console.error('❌ Error al procesar cuenta:', cuenta.id, err);
      }
    }

    // 5. REGISTRAR ÉXITO EN HISTORIAL
    const successMessage = `Sincronización completada exitosamente. Registros procesados: ${registrosProcesados}`;
    
    await supabase.from('quantum_sync_history').insert({
      status: 'success',
      message: successMessage,
      records_processed: registrosProcesados,
      error_details: null
    });

    console.log('🎉', successMessage);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: successMessage,
        records_processed: registrosProcesados
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error general:', error);
    
    // Registrar error general
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: 'Error general en la sincronización',
        records_processed: 0,
        error_details: { error: error.message, stack: error.stack }
      });
    } catch (logError) {
      console.error('❌ Error al registrar en historial:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
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