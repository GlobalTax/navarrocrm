import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PDFRequest {
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
    const { content, title, templateName }: PDFRequest = await req.json();

    // Create HTML template for PDF generation
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .document-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .template-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .content {
          text-align: justify;
          margin-bottom: 40px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 20px;
        }
        p {
          margin-bottom: 16px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="document-title">${title}</div>
        <div class="template-info">Generado desde: ${templateName}</div>
        <div class="template-info">Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
      </div>
      
      <div class="content">
        ${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/^/, '<p>').replace(/$/, '</p>')}
      </div>
      
      <div class="footer">
        <p>Documento generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </body>
    </html>
    `;

    // For now, return the HTML content that can be used by the frontend to generate PDF
    // In a production environment, you might want to use a PDF generation service
    return new Response(JSON.stringify({ 
      html: htmlContent,
      success: true,
      message: "HTML generado para conversión a PDF"
    }), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
    });
  } catch (error: any) {
    console.error("Error in generate-document-pdf function:", error);
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