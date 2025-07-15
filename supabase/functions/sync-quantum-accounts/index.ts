import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface QuantumAccount {
  id: string;
  name: string;
  currentBalance: number;
  debit: number;
  credit: number;
}

interface QuantumResponse {
  accounts?: QuantumAccount[];
  getaccounts?: QuantumAccount[];
}

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
    console.log('🚀 Iniciando sincronización robusta con Quantum Economics');
    
    // Inicializar cliente Supabase con service role para bypass RLS
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

    // Obtener credenciales de Quantum desde secretos
    const quantumToken = Deno.env.get('quantum_api_token');
    const companyId = '28171'; // Hardcoded por ahora - puedes agregar quantum_company_id después
    
    console.log('🔑 Verificando credenciales...');
    console.log('Token presente:', quantumToken ? 'SÍ' : 'NO');
    console.log('Company ID:', companyId);

    if (!quantumToken) {
      const errorMsg = 'Error: Token de Quantum Economics no configurado. Verifique que "quantum_api_token" esté configurado en Supabase Edge Functions.';
      console.error('❌', errorMsg);
      
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: errorMsg,
        records_processed: 0,
        error_details: { 
          quantum_token_present: false,
          company_id: companyId 
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

    // Construir URL de la API - probamos ambos formatos de auth
    const apiUrl = `https://app.quantumeconomics.es/contabilidad/ws/account?companyId=${companyId}&year=2024&accountType=C`;
    console.log('📡 Llamando a API Quantum:', apiUrl);

    // Intentar múltiples formatos de autorización
    let response: Response;
    let authMethod = '';
    
    try {
      // Primer intento: Bearer
      console.log('🔐 Intentando autenticación Bearer...');
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${quantumToken}`,
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        }
      });
      authMethod = 'Bearer';
      
      if (!response.ok) {
        console.log('⚠️ Bearer falló, intentando API-KEY...');
        // Segundo intento: API-KEY
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `API-KEY ${quantumToken}`,
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0'
          }
        });
        authMethod = 'API-KEY';
      }
    } catch (fetchError) {
      console.error('❌ Error en fetch:', fetchError);
      throw new Error(`Error de conexión con Quantum: ${fetchError.message}`);
    }

    console.log('📊 Respuesta API status:', response.status, 'con método:', authMethod);

    if (!response.ok) {
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = 'No se pudo leer la respuesta';
      }
      
      const errorMsg = `Error en API Quantum: ${response.status} ${response.statusText}`;
      console.error('❌', errorMsg, 'Respuesta:', responseText);
      
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: errorMsg,
        records_processed: 0,
        error_details: { 
          status: response.status,
          statusText: response.statusText,
          authMethod,
          response: responseText
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

    const data: QuantumResponse = await response.json();
    console.log('📋 Estructura de respuesta:', Object.keys(data));

    // Verificar estructura de respuesta - probamos ambos formatos
    const accounts = data.accounts || data.getaccounts;
    if (!accounts || !Array.isArray(accounts)) {
      const errorMsg = 'Error: La respuesta de la API no contiene cuentas válidas. Estructura recibida: ' + JSON.stringify(Object.keys(data));
      console.error('❌', errorMsg);
      
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: errorMsg,
        records_processed: 0,
        error_details: { 
          response_structure: Object.keys(data),
          authMethod,
          sample_data: data
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

    // Procesar y guardar cada cuenta
    let registrosProcesados = 0;
    const errores: string[] = [];
    
    console.log(`💾 Procesando ${accounts.length} cuentas...`);

    for (const cuenta of accounts) {
      try {
        // Validar datos de la cuenta
        if (!cuenta.id || !cuenta.name) {
          console.warn('⚠️ Cuenta con datos incompletos:', cuenta);
          errores.push(`Cuenta con ID o nombre vacío: ${JSON.stringify(cuenta)}`);
          continue;
        }

        const { error } = await supabase
          .from('cuentas')
          .upsert({
            id: cuenta.id,
            nombre: cuenta.name,
            balance_actual: cuenta.currentBalance || 0,
            debito: cuenta.debit || 0,
            credito: cuenta.credit || 0,
            datos_completos: cuenta
          }, {
            onConflict: 'id'
          });

        if (error) {
          console.error('❌ Error al guardar cuenta:', cuenta.id, error);
          errores.push(`Error en cuenta ${cuenta.id}: ${error.message}`);
        } else {
          registrosProcesados++;
          console.log('✅ Cuenta guardada:', cuenta.id, cuenta.name);
        }
      } catch (err) {
        console.error('❌ Error al procesar cuenta:', cuenta.id, err);
        errores.push(`Error al procesar cuenta ${cuenta.id}: ${err.message}`);
      }
    }

    // Registrar resultado en historial
    const syncResult = {
      status: errores.length === 0 ? 'success' : 'partial_success',
      message: `Sincronización completada. Registros procesados: ${registrosProcesados}${errores.length > 0 ? `, errores: ${errores.length}` : ''}`,
      records_processed: registrosProcesados,
      error_details: errores.length > 0 ? { 
        errores, 
        authMethod,
        total_accounts: accounts.length
      } : null
    };

    console.log('📝 Registrando resultado:', syncResult);

    const { error: historyError } = await supabase
      .from('quantum_sync_history')
      .insert(syncResult);

    if (historyError) {
      console.error('❌ Error al registrar historial:', historyError);
    }

    const resultMessage = `Sincronización exitosa: ${registrosProcesados} cuentas procesadas${errores.length > 0 ? `, ${errores.length} errores` : ''}`;
    console.log('🎉', resultMessage);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: resultMessage,
        data: {
          processed: registrosProcesados,
          errors: errores.length,
          total: accounts.length,
          authMethod
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error general en sincronización:', error);
    
    // Intentar registrar el error en historial
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        await supabase.from('quantum_sync_history').insert({
          status: 'error',
          message: 'Error general en la sincronización',
          records_processed: 0,
          error_details: { 
            error: error.message, 
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (logError) {
      console.error('❌ Error al registrar historial de error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Error interno del servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});