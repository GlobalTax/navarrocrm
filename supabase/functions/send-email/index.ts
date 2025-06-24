
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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 [Send Email] Iniciando envío de email con Resend...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY no está configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    const { to, subject, html, invitationToken }: EmailRequest = await req.json();

    console.log('📧 [Send Email] Datos recibidos:', { to, subject, hasToken: !!invitationToken });

    // Enviar email real con Resend
    const emailResponse = await resend.emails.send({
      from: 'CRM Sistema <s.navarro@nrro.es>',
      to: [to],
      subject: subject,
      html: html,
    });

    console.log('📧 [Send Email] Email enviado exitosamente:', emailResponse);

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

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email enviado exitosamente',
      messageId: emailResponse.data?.id || emailResponse.id
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
