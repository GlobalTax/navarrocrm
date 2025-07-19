
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, user_id, org_id, code } = await req.json()

    const nylasApiKey = Deno.env.get('NYLAS_API_KEY')
    const nylasApplicationId = Deno.env.get('NYLAS_APPLICATION_ID')
    const nylasApiUri = Deno.env.get('NYLAS_API_URI') || 'https://api.us.nylas.com'
    
    // Construir la redirect_uri correcta usando la URL base de la aplicación
    const baseUrl = req.headers.get('origin') || 'https://9142507d-4b1f-4f46-bca7-16102ac6aa30.lovableproject.com'
    const redirectUri = `${baseUrl}/nylas/callback`

    // Logging detallado para debugging
    console.log('🔧 [Nylas Auth] Environment Configuration:', {
      hasApiKey: !!nylasApiKey,
      hasApplicationId: !!nylasApplicationId,
      apiUri: nylasApiUri,
      redirectUri,
      baseUrl,
      action
    })

    if (!nylasApiKey || !nylasApplicationId) {
      const error = 'Variables de entorno de Nylas no configuradas completamente'
      console.error('❌ [Nylas Auth] Configuration Error:', {
        hasApiKey: !!nylasApiKey,
        hasApplicationId: !!nylasApplicationId
      })
      throw new Error(error)
    }

    if (action === 'get_auth_url') {
      // Scopes completos según especificaciones de Nylas v3
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/contacts'
      ].join(' ')

      // Generar URL de autorización para Nylas v3 según especificaciones
      const authUrl = `${nylasApiUri}/v3/connect/auth?` +
        `client_id=${nylasApplicationId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `state=${user_id}&` +
        `prompt=consent`

      console.log('✅ [Nylas Auth] Generated auth URL successfully:', {
        applicationId: nylasApplicationId,
        redirectUri,
        scopes: scopes.split(' ').length,
        userId: user_id
      })

      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'exchange_code') {
      console.log('🔄 [Nylas Auth] Starting code exchange:', { 
        hasCode: !!code, 
        userId: user_id, 
        orgId: org_id 
      })
      
      // Intercambiar código por grant usando Nylas v3
      const tokenResponse = await fetch(`${nylasApiUri}/v3/connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nylasApiKey}`,
        },
        body: JSON.stringify({
          client_id: nylasApplicationId,
          redirect_uri: redirectUri,
          code: code,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('❌ [Nylas Auth] Token exchange failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          error: errorText,
          redirectUri,
          applicationId: nylasApplicationId
        })
        throw new Error(`Error intercambiando código: ${tokenResponse.status} - ${errorText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('✅ [Nylas Auth] Token exchange successful:', {
        hasGrantId: !!tokenData.grant_id,
        grantId: tokenData.grant_id?.substring(0, 10) + '...'
      })

      // Obtener información del grant
      const grantResponse = await fetch(`${nylasApiUri}/v3/grants/${tokenData.grant_id}`, {
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Accept': 'application/json',
        }
      })

      const grantData = grantResponse.ok ? await grantResponse.json() : null
      console.log('📋 [Nylas Auth] Grant data retrieved:', {
        hasGrantData: !!grantData,
        email: grantData?.email,
        provider: grantData?.provider,
        accountId: grantData?.account_id
      })

      // Guardar conexión en base de datos con el nuevo esquema v3
      const connectionData = {
        user_id,
        org_id,
        grant_id: tokenData.grant_id,
        application_id: nylasApplicationId,
        account_id: grantData?.account_id || null,
        email_address: grantData?.email || 'unknown@email.com',
        provider: grantData?.provider || 'gmail',
        scopes: grantData?.scopes || [],
        status: 'connected',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('nylas_connections')
        .upsert(connectionData)

      if (error) {
        console.error('❌ [Nylas Auth] Database save failed:', error)
        throw new Error(`Error guardando conexión: ${error.message}`)
      }

      console.log('✅ [Nylas Auth] Connection saved successfully:', {
        grantId: tokenData.grant_id,
        email: grantData?.email,
        provider: grantData?.provider
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          grant_id: tokenData.grant_id,
          email: grantData?.email || 'unknown@email.com',
          provider: grantData?.provider || 'gmail'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'check_connection') {
      console.log('🔍 [Nylas Auth] Checking connection:', { userId: user_id, orgId: org_id })
      
      // Verificar estado de conexión
      const { data: connection, error: fetchError } = await supabase
        .from('nylas_connections')
        .select('*')
        .eq('user_id', user_id)
        .eq('org_id', org_id)
        .eq('status', 'connected')
        .single()

      if (fetchError || !connection) {
        console.log('ℹ️ [Nylas Auth] No connection found:', { 
          hasError: !!fetchError, 
          errorCode: fetchError?.code 
        })
        return new Response(
          JSON.stringify({ connected: false }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      // Verificar si el grant sigue siendo válido usando Nylas v3
      const testResponse = await fetch(`${nylasApiUri}/v3/grants/${connection.grant_id}`, {
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Accept': 'application/json',
        }
      })

      const isValid = testResponse.ok
      
      console.log('✅ [Nylas Auth] Connection check completed:', {
        grantId: connection.grant_id?.substring(0, 10) + '...',
        isValid,
        email: connection.email_address,
        provider: connection.provider
      })

      return new Response(
        JSON.stringify({
          connected: isValid,
          grant_id: connection.grant_id,
          email: connection.email_address,
          provider: connection.provider,
          last_sync: connection.updated_at,
          account_id: connection.account_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log('❌ [Nylas Auth] Invalid action:', action)
    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('❌ [Nylas Auth] Function error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Error interno del servidor',
        success: false,
        debug: {
          timestamp: new Date().toISOString(),
          errorType: error.name
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
