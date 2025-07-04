import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  title: string;
  templateName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, content, title, templateName }: EmailRequest = await req.json();

    // Create professional email template
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
        }
        .header { 
          background: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          border-bottom: 3px solid #0061ff; 
        }
        .content { 
          padding: 30px 20px; 
          background: white; 
        }
        .document-content {
          background: #f8f9fa;
          padding: 20px;
          border-left: 4px solid #0061ff;
          margin: 20px 0;
          white-space: pre-wrap;
        }
        .footer { 
          background: #f8f9fa; 
          padding: 15px; 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>📄 Documento: ${title}</h2>
        <p>Generado desde plantilla: ${templateName}</p>
      </div>
      
      <div class="content">
        <p>Estimado/a,</p>
        <p>Le enviamos el documento solicitado generado automáticamente:</p>
        
        <div class="document-content">
          ${content.replace(/\n\n/g, '\n\n').replace(/\n/g, '<br>')}
        </div>
        
        <p>Si tiene alguna pregunta o necesita modificaciones, no dude en contactarnos.</p>
        
        <p>Atentamente,<br>
        Equipo Legal</p>
      </div>
      
      <div class="footer">
        <p>Este documento fue generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </body>
    </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Documentos <documentos@resend.dev>",
      to: [to],
      subject: subject || `📄 ${title}`,
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
    console.error("Error in send-document-email function:", error);
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