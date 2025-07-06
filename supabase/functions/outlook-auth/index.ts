
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OutlookAuthRequest {
  code?: string
  action: 'get_auth_url' | 'exchange_code' | 'refresh_token'
  refresh_token?: string
  user_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener credenciales de Microsoft Graph desde Supabase secrets
    const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')
    const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      throw new Error('Microsoft Graph API credentials not configured')
    }

    const redirectUri = `${req.headers.get('origin') || 'http://localhost:3000'}/auth/outlook/callback`
    const scope = 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access'
    const tenantId = 'common'

    // Handle GET requests (callback from Microsoft)
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const code = url.searchParams.get('code')
      
      if (code) {
        // Return HTML page that will handle the callback
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Outlook Authentication</title>
            </head>
            <body>
              <script>
                const code = '${code}';
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'OUTLOOK_AUTH_CODE',
                    code: code
                  }, '*');
                  window.close();
                } else {
                  window.location.href = '/emails/dashboard';
                }
              </script>
              <p>Autenticación completada. Esta ventana se cerrará automáticamente...</p>
            </body>
          </html>
        `
        
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' }
        })
      }
    }

    // Handle POST requests
    const { code, action, refresh_token, user_id }: OutlookAuthRequest = await req.json()

    switch (action) {
      case 'get_auth_url': {
        const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
          `client_id=${clientId}&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_mode=query&` +
          `scope=${encodeURIComponent(scope)}`

        return new Response(
          JSON.stringify({ auth_url: authUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'exchange_code': {
        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
        
        const body = new URLSearchParams({
          client_id: clientId,
          scope: scope,
          code: code!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          client_secret: clientSecret
        })

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
          throw new Error(`OAuth error: ${tokenData.error_description}`)
        }

        // Obtener info del usuario de Microsoft Graph
        const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        })
        const userData = await userResponse.json()

        // Obtener el usuario autenticado y su org_id
        const authHeader = req.headers.get('Authorization')
        const { data: { user: authUser } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
        
        if (!authUser) {
          throw new Error('Usuario no autenticado')
        }

        // Obtener org_id del usuario
        const { data: userProfile } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', authUser.id)
          .single()

        if (!userProfile?.org_id) {
          throw new Error('Usuario sin organización asignada')
        }

        // Guardar tokens en la base de datos
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
        
        // Encriptar tokens (simple base64 para demostración)
        const encryptedAccessToken = btoa(tokenData.access_token)
        const encryptedRefreshToken = btoa(tokenData.refresh_token)
        
        console.log('Insertando token para usuario:', authUser.id, 'org:', userProfile.org_id)
        
        const { data: userToken, error: insertError } = await supabase
          .from('user_outlook_tokens')
          .upsert({
            user_id: authUser.id,
            org_id: userProfile.org_id,
            access_token_encrypted: encryptedAccessToken,
            refresh_token_encrypted: encryptedRefreshToken,
            token_expires_at: expiresAt.toISOString(),
            scope_permissions: tokenData.scope ? tokenData.scope.split(' ') : [],
            outlook_email: userData.mail || userData.userPrincipalName,
            is_active: true
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Error insertando token:', insertError)
          throw new Error(`Error guardando token: ${insertError.message}`)
        }
        
        console.log('Token insertado exitosamente:', userToken?.id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            user_email: userData.mail,
            expires_at: expiresAt 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'refresh_token': {
        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
        
        const body = new URLSearchParams({
          client_id: clientId,
          scope: scope,
          refresh_token: refresh_token!,
          grant_type: 'refresh_token',
          client_secret: clientSecret
        })

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
          throw new Error(`Refresh token error: ${tokenData.error_description}`)
        }

        // Actualizar tokens
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
        
        // Encriptar tokens actualizados
        const encryptedAccessToken = btoa(tokenData.access_token)
        const encryptedRefreshToken = btoa(tokenData.refresh_token)
        
        // Obtener el usuario autenticado
        const authHeader = req.headers.get('Authorization')
        const { data: { user: authUser } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
        
        if (!authUser) {
          throw new Error('Usuario no autenticado')
        }

        const { data } = await supabase
          .from('user_outlook_tokens')
          .update({
            access_token_encrypted: encryptedAccessToken,
            refresh_token_encrypted: encryptedRefreshToken,
            token_expires_at: expiresAt.toISOString()
          })
          .eq('user_id', authUser.id)
          .select()
          .single()

        return new Response(
          JSON.stringify({ success: true, expires_at: expiresAt }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Acción no válida')
    }

  } catch (error) {
    console.error('Error en outlook-auth:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
