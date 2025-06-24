
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  invitationToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 [Send Email] Iniciando envío de email...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { to, subject, html, invitationToken }: EmailRequest = await req.json();

    console.log('📧 [Send Email] Datos recibidos:', { to, subject, hasToken: !!invitationToken });

    // Por ahora simulamos el envío del email
    // En producción aquí integrarías con Resend, SendGrid, etc.
    console.log('📧 [Send Email] Simulando envío de email a:', to);
    console.log('📧 [Send Email] Asunto:', subject);
    console.log('📧 [Send Email] Contenido HTML:', html.substring(0, 100) + '...');

    // Si es una invitación, registrar en log de auditoría
    if (invitationToken) {
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
      }
    }

    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email enviado exitosamente (simulado)',
      messageId: `sim_${Date.now()}`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ [Send Email] Error:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
