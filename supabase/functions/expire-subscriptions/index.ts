import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Starting subscription expiration check...')

    // Buscar suscripciones que han expirado
    const { data: expiredSubscriptions, error: selectError } = await supabase
      .from('subscriptions')
      .select('id, contact_id, plan_name, end_date, status')
      .in('status', ['ACTIVE', 'PAUSED'])
      .not('end_date', 'is', null)
      .lt('end_date', new Date().toISOString().split('T')[0])

    if (selectError) {
      console.error('❌ Error selecting expired subscriptions:', selectError)
      throw selectError
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('✅ No expired subscriptions found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired subscriptions found',
          expiredCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`📋 Found ${expiredSubscriptions.length} expired subscriptions`)

    // Actualizar estado a EXPIRED
    const { data: updatedSubscriptions, error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'EXPIRED',
        updated_at: new Date().toISOString()
      })
      .in('id', expiredSubscriptions.map(sub => sub.id))
      .select()

    if (updateError) {
      console.error('❌ Error updating subscription status:', updateError)
      throw updateError
    }

    // Registrar en logs para auditoría
    for (const subscription of expiredSubscriptions) {
      console.log(`🔄 Expired subscription: ${subscription.id} - ${subscription.plan_name}`)
    }

    console.log(`✅ Successfully expired ${updatedSubscriptions?.length || 0} subscriptions`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully expired ${updatedSubscriptions?.length || 0} subscriptions`,
        expiredCount: updatedSubscriptions?.length || 0,
        expiredSubscriptions: updatedSubscriptions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in expire-subscriptions function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})