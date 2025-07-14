import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateDocumentRequest {
  documentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { documentId }: GenerateDocumentRequest = await req.json();

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "documentId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get document data
    const { data: document, error: docError } = await supabase
      .from("employee_onboarding_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Convert HTML to PDF using a simple approach
    // In a real implementation, you'd use a service like Puppeteer or similar
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${document.document_name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              margin: 40px;
              color: #333;
            }
            h1, h2, h3 { color: #2563eb; }
            .signature-section {
              margin-top: 60px;
              border-top: 1px solid #ccc;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          ${document.content}
          ${document.requires_signature ? `
            <div class="signature-section">
              <p><strong>Firma:</strong> _________________________</p>
              <p><strong>Fecha:</strong> _________________________</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    // For this demo, we'll store the HTML content directly
    // In production, you'd convert this to PDF using a proper service
    const fileName = `${document.document_name.replace(/[^a-zA-Z0-9]/g, '_')}_${documentId}.html`;
    const filePath = `${document.onboarding_id}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("employee-documents")
      .upload(filePath, new Blob([htmlContent], { type: "text/html" }), {
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload document" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("employee-documents")
      .getPublicUrl(filePath);

    // Update document with PDF URL
    const { error: updateError } = await supabase
      .from("employee_onboarding_documents")
      .update({ 
        pdf_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update document" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_url: urlData.publicUrl 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

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