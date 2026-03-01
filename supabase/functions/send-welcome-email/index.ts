import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const roleLabels: Record<string, string> = {
  partner: "Socio",
  area_manager: "Responsable de Área",
  senior: "Senior",
  junior: "Junior",
  finance: "Finanzas",
  client: "Cliente",
};

interface CredentialsPayload {
  mode: "credentials";
  email: string;
  password: string;
  role: string;
  firstName?: string;
}

interface ActivationPayload {
  mode: "activation";
  email: string;
  role: string;
  token: string;
  firstName?: string;
}

type Payload = CredentialsPayload | ActivationPayload;

function buildCredentialsHtml(p: CredentialsPayload, siteUrl: string): string {
  const roleLabel = roleLabels[p.role] || p.role;
  const greeting = p.firstName ? `Hola ${p.firstName},` : "Hola,";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#f8f9fa;padding:30px;border-radius:10px;border:1px solid #e9ecef;">
    <h1 style="color:#0061FF;text-align:center;margin-bottom:30px;">🔑 Tus credenciales de acceso</h1>
    <p style="font-size:16px;">${greeting}</p>
    <p style="font-size:16px;">Se ha creado tu cuenta en el CRM Legal con el rol de <strong>${roleLabel}</strong>.</p>

    <div style="background:#fff;padding:20px;border-radius:10px;border:1px solid #dee2e6;margin:20px 0;">
      <p style="margin:0 0 10px;font-size:14px;"><strong>📧 Email:</strong> ${p.email}</p>
      <p style="margin:0;font-size:14px;"><strong>🔒 Contraseña temporal:</strong> <code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;">${p.password}</code></p>
    </div>

    <div style="text-align:center;margin:30px 0;">
      <a href="${siteUrl}/login" style="background:#0061FF;color:white;padding:15px 30px;text-decoration:none;border-radius:10px;font-weight:bold;display:inline-block;">Iniciar sesión</a>
    </div>

    <div style="background:#fff3cd;padding:12px;border-radius:8px;border:1px solid #ffeaa7;margin:20px 0;">
      <p style="margin:0;font-size:13px;">⚠️ Te recomendamos cambiar tu contraseña tras el primer inicio de sesión.</p>
    </div>

    <hr style="border:none;border-top:1px solid #e9ecef;margin:30px 0;">
    <p style="font-size:12px;color:#6c757d;text-align:center;">Si no esperabas este email, puedes ignorarlo.</p>
  </div>
</body></html>`;
}

function buildActivationHtml(p: ActivationPayload, siteUrl: string): string {
  const roleLabel = roleLabels[p.role] || p.role;
  const greeting = p.firstName ? `Hola ${p.firstName},` : "Hola,";
  const activationUrl = `${siteUrl}/activate-account?token=${p.token}`;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#f8f9fa;padding:30px;border-radius:10px;border:1px solid #e9ecef;">
    <h1 style="color:#0061FF;text-align:center;margin-bottom:30px;">🎉 ¡Bienvenido al CRM Legal!</h1>
    <p style="font-size:16px;">${greeting}</p>
    <p style="font-size:16px;">Se ha creado tu cuenta con el rol de <strong>${roleLabel}</strong>. Haz clic en el botón para activar tu cuenta y establecer tu contraseña.</p>

    <div style="text-align:center;margin:30px 0;">
      <a href="${activationUrl}" style="background:#0061FF;color:white;padding:15px 30px;text-decoration:none;border-radius:10px;font-weight:bold;display:inline-block;">🚀 Activar mi cuenta</a>
    </div>

    <div style="background:#fff3cd;padding:12px;border-radius:8px;border:1px solid #ffeaa7;margin:20px 0;">
      <p style="margin:0;font-size:13px;">📧 <strong>Tu email:</strong> ${p.email}<br>👤 <strong>Tu rol:</strong> ${roleLabel}</p>
    </div>

    <p style="font-size:13px;color:#666;margin-top:20px;">Si no puedes hacer clic en el botón, copia y pega este enlace:</p>
    <p style="font-size:12px;word-break:break-all;background:#f8f9fa;padding:10px;border-radius:4px;">${activationUrl}</p>

    <hr style="border:none;border-top:1px solid #e9ecef;margin:30px 0;">
    <p style="font-size:12px;color:#6c757d;text-align:center;">Esta invitación expira en 7 días.</p>
  </div>
</body></html>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    const payload: Payload = await req.json();
    const siteUrl = Deno.env.get("SITE_URL") || "https://navarrocrm.lovable.app";

    let html: string;
    let subject: string;

    if (payload.mode === "credentials") {
      html = buildCredentialsHtml(payload, siteUrl);
      subject = "🔑 Tus credenciales de acceso al CRM Legal";
    } else if (payload.mode === "activation") {
      html = buildActivationHtml(payload, siteUrl);
      subject = "🎉 Activa tu cuenta en el CRM Legal";
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use 'credentials' or 'activation'." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📧 Sending ${payload.mode} email to ${payload.email}`);

    const emailResponse = await resend.emails.send({
      from: "CRM Legal NRRO <s.navarro@nrro.es>",
      to: [payload.email],
      subject,
      html,
    });

    if (emailResponse.error) {
      console.error("❌ Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: emailResponse.error.message, success: false }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("✅ Email sent:", emailResponse);
    return new Response(
      JSON.stringify({ success: true, data: emailResponse.data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
