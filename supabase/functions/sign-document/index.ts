import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignDocumentRequest {
  documentId: string;
  signature: string;
  signedAt: string;
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

    const { documentId, signature, signedAt }: SignDocumentRequest = await req.json();

    if (!documentId || !signature || !signedAt) {
      return new Response(
        JSON.stringify({ error: "documentId, signature, and signedAt are required" }),
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

    // Prepare signature data
    const signatureData = {
      signature: signature,
      signed_at: signedAt,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
      signature_token: crypto.randomUUID()
    };

    // Update document with signature
    const { error: updateError } = await supabase
      .from("employee_onboarding_documents")
      .update({
        status: "signed",
        signature_data: signatureData,
        signed_at: signedAt,
        updated_at: new Date().toISOString()
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to sign document" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate signed PDF if PDF URL exists
    if (document.pdf_url) {
      try {
        // Add signature to existing content
        const signedContent = document.content + `
          <div style="margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px;">
            <p><strong>Firmado digitalmente por:</strong> ${signature}</p>
            <p><strong>Fecha de firma:</strong> ${new Date(signedAt).toLocaleString('es-ES')}</p>
            <p><strong>Token de verificación:</strong> ${signatureData.signature_token}</p>
          </div>
        `;

        const signedHtmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>${document.document_name} - FIRMADO</title>
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
                  background-color: #f8f9fa;
                  padding: 20px;
                  border-radius: 8px;
                }
              </style>
            </head>
            <body>
              ${signedContent}
            </body>
          </html>
        `;

        // Upload signed version
        const signedFileName = `${document.document_name.replace(/[^a-zA-Z0-9]/g, '_')}_${documentId}_SIGNED.html`;
        const signedFilePath = `${document.onboarding_id}/${signedFileName}`;

        const { data: signedUploadData, error: signedUploadError } = await supabase.storage
          .from("employee-documents")
          .upload(signedFilePath, new Blob([signedHtmlContent], { type: "text/html" }), {
            upsert: true,
          });

        if (!signedUploadError) {
          const { data: signedUrlData } = supabase.storage
            .from("employee-documents")
            .getPublicUrl(signedFilePath);

          // Update with signed PDF URL
          await supabase
            .from("employee_onboarding_documents")
            .update({ pdf_url: signedUrlData.publicUrl })
            .eq("id", documentId);
        }
      } catch (pdfError) {
        console.error("Error generating signed PDF:", pdfError);
        // Continue even if PDF generation fails
      }
    }

    // Check if all required documents are signed for this onboarding
    const { data: allDocs, error: allDocsError } = await supabase
      .from("employee_onboarding_documents")
      .select("status, requires_signature")
      .eq("onboarding_id", document.onboarding_id);

    if (!allDocsError && allDocs) {
      const pendingSignatures = allDocs.filter(doc => 
        doc.requires_signature && doc.status !== "signed"
      );

      if (pendingSignatures.length === 0) {
        // All required documents are signed, update onboarding status
        await supabase
          .from("employee_onboarding")
          .update({ 
            current_step: 5,
            updated_at: new Date().toISOString()
          })
          .eq("id", document.onboarding_id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Document signed successfully",
        signature_token: signatureData.signature_token
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in sign-document function:", error);
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