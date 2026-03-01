import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "https://esm.sh/resend@2.0.0";

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

    // Validar autenticación del usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado', success: false, errorCode: 'UNAUTHORIZED' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const supabaseAuth = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: 'No autorizado', success: false, errorCode: 'UNAUTHORIZED' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

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

    console.log('📧 [Send Email] API Key configurada');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    const { to, subject, html, invitationToken, testMode }: EmailRequest = await req.json();

    console.log('📧 [Send Email] Procesando solicitud, testMode:', !!testMode);

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
        // Enviar email de prueba con dominio por defecto de Resend
        const testResponse = await resend.emails.send({
          from: 'CRM Sistema <onboarding@resend.dev>',
          to: [to],
          subject: 'Test de configuración - CRM Sistema',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Test de configuración exitoso</h2>
              <p>Este es un email de prueba para verificar que la configuración de Resend funciona correctamente con tu dominio personalizado.</p>
              <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
              <p>Si recibes este email, la configuración está funcionando perfectamente.</p>
            </div>
          `,
        });

        console.log('📧 [Send Email] Test exitoso:', testResponse);
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Test de configuración exitoso con dominio personalizado',
          messageId: testResponse.data?.id,
          testMode: true,
          domain: 'resend.dev'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (testError: any) {
        console.error('❌ [Send Email] Error en test:', testError.message);
        return new Response(JSON.stringify({
          error: 'Error en test de configuración',
          success: false,
          errorCode: 'TEST_FAILED'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Enviar email real con dominio por defecto de Resend
    console.log('📧 [Send Email] Enviando email...');
    
    let emailResponse;
    let usedDomain = 'resend.dev';
    
    try {
      console.log('📧 [Send Email] Enviando con dominio por defecto...');
      emailResponse = await resend.emails.send({
        from: 'CRM Sistema <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      });

      if (emailResponse.error) {
        throw new Error(emailResponse.error.message || 'Error enviando email');
      }

      console.log('📧 [Send Email] Email enviado exitosamente:', emailResponse);
    } catch (emailError: any) {
      console.error('❌ [Send Email] Error enviando email:', emailError);
      throw new Error(`Error enviando email: ${emailError.message}`);
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
              new_value: { email: to, role: invitation.role, domain: usedDomain },
              details: `Invitación enviada a ${to} para rol ${invitation.role} desde dominio ${usedDomain}`
            });
          
          console.log('📧 [Send Email] Auditoría registrada exitosamente');
        }
      } catch (auditError: any) {
        console.error('⚠️ [Send Email] Error en auditoría (no crítico):', auditError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Email enviado exitosamente desde dominio ${usedDomain}`,
      messageId: (emailResponse as any)?.data?.id || (emailResponse as any)?.id,
      domain: usedDomain,
      fallbackUsed: false
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ [Send Email] Error:', error.message);

    return new Response(JSON.stringify({
      error: 'Error enviando email',
      success: false,
      errorCode: 'SEND_FAILED'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);