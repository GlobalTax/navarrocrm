
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
    const nylasClientId = Deno.env.get('NYLAS_CLIENT_ID')
    const nylasClientSecret = Deno.env.get('NYLAS_CLIENT_SECRET')
    const nylasApplicationId = Deno.env.get('NYLAS_APPLICATION_ID')
    
    // CORRECCIÓN: Usar nuestra propia URL como redirect_uri
    const redirectUri = Deno.env.get('NYLAS_REDIRECT_URI') || 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/nylas/callback'

    if (!nylasApiKey || !nylasClientId || !nylasClientSecret || !nylasApplicationId) {
      throw new Error('Variables de entorno de Nylas no configuradas completamente')
    }

    console.log('Nylas config:', {
      hasApiKey: !!nylasApiKey,
      hasClientId: !!nylasClientId,
      hasClientSecret: !!nylasClientSecret,
      hasApplicationId: !!nylasApplicationId,
      redirectUri
    })

    if (action === 'get_auth_url') {
      // CORRECCIÓN: Usar Google OAuth directamente en lugar de Nylas Connect
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${nylasClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email')}&` +
        `access_type=offline&` +
        `state=${user_id}&` +
        `prompt=consent`

      console.log('Generated auth URL:', authUrl)

      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'exchange_code') {
      console.log('Intercambiando código por token:', { code, user_id, org_id })
      
      // CORRECCIÓN: Usar Google OAuth para obtener tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: nylasClientId,
          client_secret: nylasClientSecret,
          redirect_uri: redirectUri,
          code: code,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Error response from Google OAuth:', errorText)
        throw new Error(`Error intercambiando código: ${errorText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('Token data from Google:', tokenData)

      // Crear grant en Nylas v3 usando el access token de Google
      const nylasGrantResponse = await fetch('https://api.us.nylas.com/v3/grants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nylasApiKey}`,
        },
        body: JSON.stringify({
          provider: 'gmail',
          settings: {
            google_client_id: nylasClientId,
            google_client_secret: nylasClientSecret,
            google_refresh_token: tokenData.refresh_token,
          },
          scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send']
        }),
      })

      if (!nylasGrantResponse.ok) {
        const errorText = await nylasGrantResponse.text()
        console.error('Error creating Nylas grant:', errorText)
        throw new Error(`Error creando grant en Nylas: ${errorText}`)
      }

      const grantData = await nylasGrantResponse.json()
      console.log('Grant data from Nylas:', grantData)

      // Obtener información del usuario desde Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        }
      })

      const userInfo = userInfoResponse.ok ? await userInfoResponse.json() : {}

      // Guardar conexión en base de datos con el nuevo esquema v3
      const { error } = await supabase
        .from('nylas_connections')
        .upsert({
          user_id,
          org_id,
          grant_id: grantData.id,
          application_id: nylasApplicationId,
          account_id: grantData.account_id || null,
          email_address: userInfo.email || 'unknown@email.com',
          provider: 'gmail',
          scopes: grantData.scope || [],
          status: 'connected'
        })

      if (error) {
        console.error('Database error:', error)
        throw new Error(`Error guardando conexión: ${error.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          grant_id: grantData.id,
          email: userInfo.email || 'unknown@email.com'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'check_connection') {
      // Verificar estado de conexión
      const { data: connection } = await supabase
        .from('nylas_connections')
        .select('*')
        .eq('user_id', user_id)
        .eq('org_id', org_id)
        .single()

      if (!connection) {
        return new Response(
          JSON.stringify({ connected: false }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      // Verificar si el grant sigue siendo válido usando Nylas v3
      const testResponse = await fetch(`https://api.us.nylas.com/v3/grants/${connection.grant_id}`, {
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Accept': 'application/json',
        }
      })

      const isValid = testResponse.ok

      return new Response(
        JSON.stringify({
          connected: isValid,
          grant_id: connection.grant_id,
          email: connection.email_address,
          provider: connection.provider,
          last_sync: connection.updated_at
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Error en autenticación de Nylas:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Error interno del servidor',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
