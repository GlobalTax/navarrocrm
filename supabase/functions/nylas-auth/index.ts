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
    const redirectUri = Deno.env.get('NYLAS_REDIRECT_URI') || 'http://localhost:5173/emails/callback'

    if (!nylasApiKey || !nylasClientId || !nylasClientSecret || !nylasApplicationId) {
      throw new Error('Variables de entorno de Nylas no configuradas completamente')
    }

    if (action === 'get_auth_url') {
      // Generar URL de autorización para Nylas v3
      const authUrl = `https://api.us.nylas.com/v3/connect/auth?` +
        `client_id=${nylasApplicationId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send&` +
        `access_type=offline&` +
        `state=${user_id}&` +
        `prompt=consent`

      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'exchange_code') {
      // Intercambiar código por grant usando Nylas v3
      const tokenResponse = await fetch('https://api.us.nylas.com/v3/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nylasApiKey}`,
        },
        body: JSON.stringify({
          client_id: nylasApplicationId,
          client_secret: nylasClientSecret,
          redirect_uri: redirectUri,
          code: code,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Error response from Nylas:', errorText)
        throw new Error(`Error intercambiando código: ${errorText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('Token data from Nylas:', tokenData)

      // Obtener información del grant
      const grantResponse = await fetch(`https://api.us.nylas.com/v3/grants/${tokenData.grant_id}`, {
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Accept': 'application/json',
        }
      })

      const grantData = grantResponse.ok ? await grantResponse.json() : null

      // Guardar conexión en base de datos con el nuevo esquema v3
      const { error } = await supabase
        .from('nylas_connections')
        .upsert({
          user_id,
          org_id,
          grant_id: tokenData.grant_id,
          application_id: nylasApplicationId,
          account_id: grantData?.account_id || null,
          email_address: grantData?.email || 'unknown@email.com',
          provider: grantData?.provider || 'gmail',
          scopes: grantData?.scopes || [],
          status: 'connected'
        })

      if (error) {
        console.error('Database error:', error)
        throw new Error(`Error guardando conexión: ${error.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          grant_id: tokenData.grant_id,
          email: grantData?.email || 'unknown@email.com'
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