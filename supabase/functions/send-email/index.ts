
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  invitationToken?: string;
  testMode?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 [Send Email] Iniciando función de envío de email...');
    
    // Verificar configuración de Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('❌ [Send Email] RESEND_API_KEY no está configurada');
      return new Response(JSON.stringify({ 
        error: 'RESEND_API_KEY no está configurada en los secretos de Supabase',
        success: false,
        errorCode: 'MISSING_API_KEY'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('📧 [Send Email] API Key encontrada, longitud:', resendApiKey.length);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    const { to, subject, html, invitationToken, testMode }: EmailRequest = await req.json();

    console.log('📧 [Send Email] Datos recibidos:', { 
      to, 
      subject, 
      hasToken: !!invitationToken,
      htmlLength: html.length,
      testMode: !!testMode
    });

    // Validar datos de entrada
    if (!to || !subject || !html) {
      console.error('❌ [Send Email] Datos de entrada incompletos');
      return new Response(JSON.stringify({ 
        error: 'Datos de entrada incompletos (to, subject, html son requeridos)',
        success: false,
        errorCode: 'INVALID_INPUT'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Si es modo test, solo verificar configuración
    if (testMode) {
      console.log('📧 [Send Email] Modo test - verificando configuración...');
      
      try {
        // Enviar email de prueba
        const testResponse = await resend.emails.send({
          from: 'CRM Sistema <onboarding@resend.dev>',
          to: [to],
          subject: 'Test de configuración - CRM Sistema',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Test de configuración exitoso</h2>
              <p>Este es un email de prueba para verificar que la configuración de Resend funciona correctamente.</p>
              <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
            </div>
          `,
        });

        console.log('📧 [Send Email] Test exitoso:', testResponse);
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Test de configuración exitoso',
          messageId: testResponse.data?.id,
          testMode: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (testError: any) {
        console.error('❌ [Send Email] Error en test:', testError);
        return new Response(JSON.stringify({ 
          error: `Error en test de configuración: ${testError.message}`,
          success: false,
          errorCode: 'TEST_FAILED',
          details: testError
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Enviar email real
    console.log('📧 [Send Email] Enviando email real...');
    
    let emailResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        emailResponse = await resend.emails.send({
          from: 'CRM Sistema <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          html: html,
        });

        if (emailResponse.error) {
          throw new Error(emailResponse.error.message || 'Error desconocido de Resend');
        }

        console.log('📧 [Send Email] Email enviado exitosamente:', emailResponse);
        break;
      } catch (sendError: any) {
        retryCount++;
        console.error(`❌ [Send Email] Intento ${retryCount} falló:`, sendError);
        
        if (retryCount >= maxRetries) {
          throw sendError;
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // Registrar en auditoría si es una invitación
    if (invitationToken) {
      console.log('📧 [Send Email] Registrando en auditoría...');
      
      try {
        const { data: invitation } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('token', invitationToken)
          .single();

        if (invitation) {
          await supabase
            .from('user_audit_log')
            .insert({
              org_id: invitation.org_id,
              target_user_id: invitation.invited_by,
              action_by: invitation.invited_by,
              action_type: 'invitation_sent',
              new_value: { email: to, role: invitation.role },
              details: `Invitación enviada a ${to} para rol ${invitation.role}`
            });
          
          console.log('📧 [Send Email] Auditoría registrada exitosamente');
        }
      } catch (auditError: any) {
        console.error('⚠️ [Send Email] Error en auditoría (no crítico):', auditError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email enviado exitosamente',
      messageId: emailResponse?.data?.id || emailResponse?.id,
      retryCount: retryCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ [Send Email] Error completo:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: `Error enviando email: ${error.message}`,
      success: false,
      errorCode: 'SEND_FAILED',
      details: {
        message: error.message,
        name: error.name
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
