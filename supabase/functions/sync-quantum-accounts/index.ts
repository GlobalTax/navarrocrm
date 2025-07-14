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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Iniciando sincronización con Quantum...');

    // Llamar a la función de sincronización final (que tiene las credenciales hardcodeadas)
    const { data: syncResult, error: syncError } = await supabase
      .rpc('sincronizar_cuentas_quantum_final');

    if (syncError) {
      console.error('Error en sincronización:', syncError);
      
      // Registrar el error en el historial
      await supabase
        .from('quantum_sync_history')
        .insert({
          status: 'error',
          message: 'Error al ejecutar la sincronización',
          records_processed: 0,
          error_details: syncError
        });

      return new Response(
        JSON.stringify({ 
          error: 'Error en la sincronización', 
          details: syncError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Resultado de sincronización:', syncResult);

    // Extraer el número de registros procesados del mensaje
    const message = syncResult || 'Sincronización completada';
    const recordsMatch = message.match(/(\d+)/);
    const recordsProcessed = recordsMatch ? parseInt(recordsMatch[1]) : 0;

    // Registrar el éxito en el historial
    await supabase
      .from('quantum_sync_history')
      .insert({
        status: 'success',
        message: message,
        records_processed: recordsProcessed,
        error_details: null
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: message,
        records_processed: recordsProcessed
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error general:', error);
    
    // Intentar registrar el error en el historial
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase
        .from('quantum_sync_history')
        .insert({
          status: 'error',
          message: 'Error general en la sincronización',
          records_processed: 0,
          error_details: { error: error.message }
        });
    } catch (logError) {
      console.error('Error al registrar en historial:', logError);
    }

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