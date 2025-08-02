import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessSignatureData {
  token: string;
  signatureData: string;
  ipAddress?: string;
  userAgent?: string;
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

    const { token, signatureData, ipAddress, userAgent } = await req.json();
    console.log('Processing signature for token:', token);

    if (!token || !signatureData) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify token and check if still valid
    const { data: signatureRecord, error: fetchError } = await supabaseClient
      .from('job_offer_signatures')
      .select('*')
      .eq('signature_token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !signatureRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired signature token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update signature record
    const { data: updatedSignature, error: updateError } = await supabaseClient
      .from('job_offer_signatures')
      .update({
        signature_data: signatureData,
        signed_at: new Date().toISOString(),
        status: 'signed',
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .eq('id', signatureRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating signature:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to process signature' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update job offer status
    const { error: jobOfferUpdateError } = await supabaseClient
      .from('job_offers')
      .update({ status: 'accepted' })
      .eq('id', signatureRecord.job_offer_id);

    if (jobOfferUpdateError) {
      console.error('Error updating job offer status:', jobOfferUpdateError);
    }

    console.log('Signature processed successfully for:', signatureRecord.candidate_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Signature processed successfully',
        signedAt: updatedSignature.signed_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-signature function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});