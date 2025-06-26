
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsPayload {
  events: any[]
  performance: any[]
  errors: any[]
  interactions: any[]
  session?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { events, performance, errors, interactions, session }: AnalyticsPayload = await req.json()

    console.log('📊 Recibiendo datos analytics:', {
      events: events?.length || 0,
      performance: performance?.length || 0,
      errors: errors?.length || 0,
      interactions: interactions?.length || 0,
      hasSession: !!session
    })

    const results = []

    // Validar y filtrar eventos con org_id válido
    const validEvents = events?.filter(event => event.orgId && event.orgId !== 'undefined') || []
    const validPerformance = performance?.filter(perf => perf.orgId && perf.orgId !== 'undefined') || []
    const validErrors = errors?.filter(err => err.orgId && err.orgId !== 'undefined') || []
    const validInteractions = interactions?.filter(interaction => interaction.orgId && interaction.orgId !== 'undefined') || []

    console.log('✅ Datos válidos después de filtrado:', {
      validEvents: validEvents.length,
      validPerformance: validPerformance.length,
      validErrors: validErrors.length,
      validInteractions: validInteractions.length
    })

    // Insertar eventos válidos
    if (validEvents.length > 0) {
      const { data, error } = await supabaseClient
        .from('analytics_events')
        .insert(validEvents.map(event => ({
          org_id: event.orgId,
          user_id: event.userId || null,
          session_id: event.sessionId,
          event_type: event.eventType,
          event_name: event.eventName,
          event_data: event.eventData || {},
          page_url: event.pageUrl,
          page_title: event.pageTitle,
          user_agent: event.userAgent,
          timestamp: new Date(event.timestamp).toISOString()
        })))

      if (error) {
        console.error('❌ Error insertando eventos:', error)
        throw error
      }

      results.push({ type: 'events', count: validEvents.length, success: true })
      console.log('✅ Eventos insertados:', validEvents.length)
    }

    // Insertar métricas de performance válidas
    if (validPerformance.length > 0) {
      const { data, error } = await supabaseClient
        .from('analytics_performance')
        .insert(validPerformance.map(perf => ({
          org_id: perf.orgId,
          user_id: perf.userId || null,
          session_id: perf.sessionId,
          page_url: perf.pageUrl,
          load_time: perf.loadTime,
          dom_content_loaded: perf.domContentLoaded,
          first_contentful_paint: perf.firstContentfulPaint,
          largest_contentful_paint: perf.largestContentfulPaint,
          first_input_delay: perf.firstInputDelay,
          cumulative_layout_shift: perf.cumulativeLayoutShift,
          time_to_interactive: perf.timeToInteractive,
          timestamp: new Date(perf.timestamp).toISOString()
        })))

      if (error) {
        console.error('❌ Error insertando performance:', error)
        throw error
      }

      results.push({ type: 'performance', count: validPerformance.length, success: true })
      console.log('✅ Métricas de performance insertadas:', validPerformance.length)
    }

    // Insertar errores válidos
    if (validErrors.length > 0) {
      const { data, error } = await supabaseClient
        .from('analytics_errors')
        .insert(validErrors.map(err => ({
          org_id: err.orgId,
          user_id: err.userId || null,
          session_id: err.sessionId,
          error_message: err.errorMessage,
          error_stack: err.errorStack,
          error_type: err.errorType,
          page_url: err.pageUrl,
          user_agent: err.userAgent,
          context_data: err.contextData || {},
          timestamp: new Date(err.timestamp).toISOString()
        })))

      if (error) {
        console.error('❌ Error insertando errores:', error)
        throw error
      }

      results.push({ type: 'errors', count: validErrors.length, success: true })
      console.log('✅ Errores insertados:', validErrors.length)
    }

    // Insertar interacciones válidas
    if (validInteractions.length > 0) {
      const { data, error } = await supabaseClient
        .from('analytics_interactions')
        .insert(validInteractions.map(interaction => ({
          org_id: interaction.orgId,
          user_id: interaction.userId || null,
          session_id: interaction.sessionId,
          interaction_type: interaction.interactionType,
          element_path: interaction.elementPath,
          page_url: interaction.pageUrl,
          interaction_data: interaction.interactionData || {},
          timestamp: new Date(interaction.timestamp).toISOString()
        })))

      if (error) {
        console.error('❌ Error insertando interacciones:', error)
        throw error
      }

      results.push({ type: 'interactions', count: validInteractions.length, success: true })
      console.log('✅ Interacciones insertadas:', validInteractions.length)
    }

    // Insertar o actualizar sesión válida
    if (session && session.orgId && session.orgId !== 'undefined') {
      const { data, error } = await supabaseClient
        .from('analytics_sessions')
        .upsert({
          session_id: session.sessionId,
          org_id: session.orgId,
          user_id: session.userId || null,
          start_time: new Date(session.startTime).toISOString(),
          end_time: session.endTime ? new Date(session.endTime).toISOString() : null,
          page_views: session.pageViews || 0,
          events_count: session.eventsCount || 0,
          errors_count: session.errorsCount || 0,
          user_agent: session.userAgent
        }, {
          onConflict: 'session_id'
        })

      if (error) {
        console.error('❌ Error insertando sesión:', error)
        throw error
      }

      results.push({ type: 'session', success: true })
      console.log('✅ Sesión actualizada:', session.sessionId)
    }

    console.log('🎉 Analytics collector completado exitosamente')

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: 'Analytics data processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('💥 Error en analytics collector:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to process analytics data'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
