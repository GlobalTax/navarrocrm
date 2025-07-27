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

    console.log('🔄 Starting outgoing subscriptions expiration check...')

    // Buscar suscripciones que han expirado (next_renewal_date en el pasado)
    const today = new Date().toISOString().split('T')[0]
    
    const { data: expiredSubscriptions, error: selectError } = await supabase
      .from('outgoing_subscriptions')
      .select('id, provider_name, next_renewal_date, status, amount, currency, org_id')
      .eq('status', 'ACTIVE')
      .not('next_renewal_date', 'is', null)
      .lt('next_renewal_date', today)

    if (selectError) {
      console.error('❌ Error selecting expired outgoing subscriptions:', selectError)
      throw selectError
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('✅ No expired outgoing subscriptions found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired outgoing subscriptions found',
          expiredCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`📋 Found ${expiredSubscriptions.length} expired outgoing subscriptions`)

    // Actualizar estado a CANCELLED
    const { data: updatedSubscriptions, error: updateError } = await supabase
      .from('outgoing_subscriptions')
      .update({ 
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .in('id', expiredSubscriptions.map(sub => sub.id))
      .select()

    if (updateError) {
      console.error('❌ Error updating outgoing subscription status:', updateError)
      throw updateError
    }

    // Registrar cada cancelación automática en logs
    for (const subscription of expiredSubscriptions) {
      console.log(`🔄 Auto-cancelled outgoing subscription: ${subscription.id} - ${subscription.provider_name} (${subscription.amount} ${subscription.currency})`)
      
      // Opcional: Insertar notificación para el responsable
      try {
        const { error: notificationError } = await supabase
          .from('ai_alert_notifications')
          .insert({
            org_id: subscription.org_id,
            user_id: subscription.org_id, // Temporal: usar org_id como user_id para notificaciones generales
            alert_type: 'subscription_auto_cancelled',
            message: `Suscripción de ${subscription.provider_name} cancelada automáticamente por vencimiento`,
            severity: 'medium',
            alert_data: {
              subscription_id: subscription.id,
              provider_name: subscription.provider_name,
              amount: subscription.amount,
              currency: subscription.currency,
              renewal_date: subscription.next_renewal_date,
              cancelled_at: new Date().toISOString()
            }
          })

        if (notificationError) {
          console.warn('⚠️ Failed to create notification for auto-cancelled subscription:', notificationError)
        }
      } catch (notifError) {
        console.warn('⚠️ Failed to create notification:', notifError)
      }
    }

    console.log(`✅ Successfully auto-cancelled ${updatedSubscriptions?.length || 0} outgoing subscriptions`)

    // Estadísticas de la ejecución
    const totalAmount = expiredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0)
    const avgAmount = expiredSubscriptions.length > 0 ? totalAmount / expiredSubscriptions.length : 0

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully auto-cancelled ${updatedSubscriptions?.length || 0} outgoing subscriptions`,
        expiredCount: updatedSubscriptions?.length || 0,
        totalAmount,
        avgAmount,
        cancelledSubscriptions: updatedSubscriptions?.map(sub => ({
          id: sub.id,
          provider_name: sub.provider_name,
          amount: sub.amount,
          currency: sub.currency
        }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in expire-outgoing-subscriptions function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})