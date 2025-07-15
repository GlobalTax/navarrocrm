import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface QuantumClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  nif?: string;
  type?: string;
  status?: string;
  [key: string]: any;
}

interface QuantumResponse {
  clients?: QuantumClient[];
  getclients?: QuantumClient[];
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
    console.log('🚀 Obteniendo clientes de Quantum Economics');
    
    // Inicializar cliente Supabase
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
    const companyId = '28171';
    
    console.log('🔑 Verificando credenciales...');
    console.log('Token presente:', quantumToken ? 'SÍ' : 'NO');
    console.log('Company ID:', companyId);

    if (!quantumToken) {
      const errorMsg = 'Error: Token de Quantum Economics no configurado.';
      console.error('❌', errorMsg);
      
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

    // Intentar múltiples endpoints de la API
    const endpoints = [
      `https://app.quantumeconomics.es/contabilidad/ws/client?companyId=${companyId}`,
      `https://app.quantumeconomics.es/contabilidad/ws/clients?companyId=${companyId}`,
      `https://app.quantumeconomics.es/contabilidad/ws/getclient?companyId=${companyId}`,
      `https://app.quantumeconomics.es/contabilidad/ws/getclients?companyId=${companyId}`
    ];

    let response: Response;
    let authMethod = '';
    let usedEndpoint = '';
    
    for (const endpoint of endpoints) {
      console.log('📡 Probando endpoint:', endpoint);
      
      try {
        // Primer intento: Bearer
        console.log('🔐 Intentando autenticación Bearer...');
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${quantumToken}`,
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0'
          }
        });
        authMethod = 'Bearer';
        usedEndpoint = endpoint;
        
        if (!response.ok) {
          console.log('⚠️ Bearer falló, intentando API-KEY...');
          // Segundo intento: API-KEY
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `API-KEY ${quantumToken}`,
              'Accept': 'application/json',
              'User-Agent': 'Supabase-Edge-Function/1.0'
            }
          });
          authMethod = 'API-KEY';
        }
        
        if (response.ok) {
          console.log('✅ Endpoint exitoso:', endpoint, 'con método:', authMethod);
          break;
        } else {
          console.log('❌ Endpoint falló:', endpoint, 'Status:', response.status);
        }
        
      } catch (fetchError) {
        console.error('❌ Error en fetch para endpoint:', endpoint, fetchError);
        continue;
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Todos los endpoints de Quantum fallaron. Último status: ${response?.status || 'Sin respuesta'}`);
    }

    console.log('📊 Respuesta API status:', response.status, 'con método:', authMethod, 'endpoint:', usedEndpoint);

    let data: QuantumResponse;
    try {
      data = await response.json();
    } catch (jsonError) {
      const errorMsg = 'Error: La respuesta de la API no es JSON válido.';
      console.error('❌', errorMsg, jsonError);
      
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

    console.log('📋 Estructura de respuesta:', Object.keys(data));

    // Verificar estructura de respuesta - probamos múltiples formatos
    const clients = data.clients || data.getclients || data.client || data.getclient;
    if (!clients) {
      const errorMsg = 'Error: La respuesta de la API no contiene clientes válidos.';
      console.error('❌', errorMsg, 'Respuesta completa:', data);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg,
          debug: {
            responseKeys: Object.keys(data),
            response: data
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Normalizar la respuesta a array
    const clientsArray = Array.isArray(clients) ? clients : [clients];
    console.log(`📋 Obtenidos ${clientsArray.length} clientes de Quantum Economics`);

    // Registrar sincronización en el historial
    try {
      await supabase.from('quantum_sync_history').insert({
        status: 'success',
        message: `Obtenidos ${clientsArray.length} clientes exitosamente`,
        records_processed: clientsArray.length,
        sync_date: new Date().toISOString()
      });
    } catch (historyError) {
      console.error('⚠️ Error al registrar historial:', historyError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          clients: clientsArray,
          total: clientsArray.length,
          authMethod,
          endpoint: usedEndpoint
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error general al obtener clientes:', error);
    
    // Registrar error en el historial
    try {
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: `Error al obtener clientes: ${error.message}`,
        records_processed: 0,
        error_details: { error: error.message, stack: error.stack },
        sync_date: new Date().toISOString()
      });
    } catch (historyError) {
      console.error('⚠️ Error al registrar historial de error:', historyError);
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