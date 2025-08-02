import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignatureRequestData {
  jobOfferId: string;
  candidateName: string;
  candidateEmail: string;
  orgId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { jobOfferId, candidateName, candidateEmail, orgId } = await req.json();
    console.log('Creating signature request for job offer:', jobOfferId);

    if (!jobOfferId || !candidateName || !candidateEmail || !orgId) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create signature record
    const { data: signatureData, error: signatureError } = await supabaseClient
      .from('job_offer_signatures')
      .insert({
        job_offer_id: jobOfferId,
        org_id: orgId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        status: 'pending'
      })
      .select()
      .single();

    if (signatureError) {
      console.error('Error creating signature record:', signatureError);
      return new Response(
        JSON.stringify({ error: 'Failed to create signature request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signing URL
    const signingUrl = `${req.headers.get('origin') || 'http://localhost:5173'}/sign-job-offer/${signatureData.signature_token}`;

    console.log('Signature request created successfully:', signatureData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        signatureId: signatureData.id,
        signingUrl,
        token: signatureData.signature_token
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-signature-request function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});