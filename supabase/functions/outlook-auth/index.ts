
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
  org_id: string
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

    const { code, action, refresh_token, org_id }: OutlookAuthRequest = await req.json()

    // Obtener configuración de la organización
    const { data: orgConfig } = await supabase
      .from('organization_integrations')
      .select('outlook_client_id, outlook_tenant_id, outlook_client_secret_encrypted')
      .eq('org_id', org_id)
      .single()

    if (!orgConfig) {
      throw new Error('Organización no configurada para Outlook')
    }

    const clientId = orgConfig.outlook_client_id
    const tenantId = orgConfig.outlook_tenant_id
    const clientSecret = orgConfig.outlook_client_secret_encrypted // En producción descifrar

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/outlook-auth`
    const scope = 'https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/Mail.Send offline_access'

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

        // Guardar tokens en la base de datos (cifrados en producción)
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
        
        const { data: userToken } = await supabase
          .from('user_outlook_tokens')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            org_id: org_id,
            access_token_encrypted: tokenData.access_token, // Cifrar en producción
            refresh_token_encrypted: tokenData.refresh_token, // Cifrar en producción
            token_expires_at: expiresAt.toISOString(),
            scope_permissions: tokenData.scope.split(' '),
            outlook_email: userData.mail || userData.userPrincipalName,
            is_active: true,
            last_used_at: new Date().toISOString()
          })
          .select()
          .single()

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
        
        const { data } = await supabase
          .from('user_outlook_tokens')
          .update({
            access_token_encrypted: tokenData.access_token,
            refresh_token_encrypted: tokenData.refresh_token,
            token_expires_at: expiresAt.toISOString(),
            last_used_at: new Date().toISOString()
          })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .eq('org_id', org_id)
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
