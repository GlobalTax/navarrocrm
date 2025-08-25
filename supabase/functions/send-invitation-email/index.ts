import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  role: string;
  token: string;
  invitedByEmail: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    if (!resend) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { email, role, token, invitedByEmail, message }: InvitationEmailRequest = await req.json();

    console.log("Sending invitation email", { email, role, invitedByEmail });

    const roleLabels: Record<string, string> = {
      'partner': 'Socio',
      'area_manager': 'Responsable de Área',
      'senior': 'Senior',
      'junior': 'Junior',
      'finance': 'Finanzas',
      'client': 'Cliente'
    };

    const roleLabel = roleLabels[role] || role;
    const activationUrl = `${Deno.env.get("SITE_URL") || "https://jzbbbwfnzpwxmuhpbdya.supabase.co"}/activate-account?token=${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitación al CRM Legal</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
            <h1 style="color: #0061FF; text-align: center; margin-bottom: 30px;">
              🎉 ¡Bienvenido al CRM Legal!
            </h1>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${invitedByEmail}</strong> te ha invitado a unirte al CRM Legal con el rol de <strong>${roleLabel}</strong>.
            </p>
            
            ${message ? `
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <p style="margin: 0; font-style: italic;">
                  "${message}"
                </p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationUrl}" 
                 style="background-color: #0061FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 10px 0;">
                🚀 Activar mi cuenta
              </a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>📧 Tu email:</strong> ${email}<br>
                <strong>👤 Tu rol:</strong> ${roleLabel}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
            </p>
            <p style="font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">
              ${activationUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6c757d; text-align: center;">
              Esta invitación expira en 7 días. Si no solicitaste esta invitación, puedes ignorar este email.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "CRM Legal <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Invitación al CRM Legal - Rol: ${roleLabel}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);