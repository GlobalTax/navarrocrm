
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
    console.log('🔧 [outlook-auth] Iniciando función edge...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener credenciales de Microsoft Graph desde Supabase secrets
    const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')
    const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')
    
    console.log('🔑 [outlook-auth] Credenciales:', { 
      clientId: clientId ? 'PRESENTE' : 'AUSENTE',
      clientSecret: clientSecret ? 'PRESENTE' : 'AUSENTE'
    })

    if (!clientId || !clientSecret) {
      console.error('❌ [outlook-auth] Credenciales no configuradas')
      throw new Error('Microsoft Graph API credentials not configured')
    }

    const redirectUri = `https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/outlook-auth`
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
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px; 
                  text-align: center;
                  background-color: #f5f5f5;
                }
                .success { color: #28a745; }
                .processing { color: #007bff; }
              </style>
            </head>
            <body>
              <div id="status" class="processing">
                <h2>🔄 Procesando autenticación...</h2>
                <p>Por favor, espere mientras procesamos su autorización.</p>
              </div>
              
              <script>
                console.log('🔧 [OAuth Callback] Página cargada, código recibido:', '${code}');
                
                function sendMessageToParent() {
                  try {
                    const message = {
                      type: 'OUTLOOK_AUTH_CODE',
                      code: '${code}',
                      timestamp: Date.now()
                    };
                    
                    console.log('📤 [OAuth Callback] Enviando mensaje:', message);
                    
                    // Enviar mensaje al opener
                    if (window.opener) {
                      window.opener.postMessage(message, '*');
                      console.log('✅ [OAuth Callback] Mensaje enviado a opener');
                      
                      document.getElementById('status').innerHTML = 
                        '<h2 class="success">✅ Autorización completada</h2><p>Esta ventana se cerrará automáticamente...</p>';
                        
                      setTimeout(() => {
                        console.log('🚪 [OAuth Callback] Cerrando ventana');
                        window.close();
                      }, 2000);
                    } else {
                      console.warn('⚠️ [OAuth Callback] No hay window.opener, redirigiendo...');
                      window.location.href = '/emails/dashboard';
                    }
                  } catch (error) {
                    console.error('❌ [OAuth Callback] Error enviando mensaje:', error);
                    document.getElementById('status').innerHTML = 
                      '<h2 style="color: red;">❌ Error</h2><p>Error procesando autorización. Cierre esta ventana e intente de nuevo.</p>';
                  }
                }
                
                // Enviar mensaje inmediatamente
                sendMessageToParent();
                
                // También enviar después de un pequeño delay por si acaso
                setTimeout(sendMessageToParent, 500);
              </script>
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
        console.log('🔗 [outlook-auth] Generando URL de autorización...')
        
        // Validar que el usuario esté autenticado para get_auth_url también
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.error('❌ [outlook-auth] No valid authorization header for get_auth_url')
          throw new Error('Header de autorización requerido')
        }
        
        const token = authHeader.replace('Bearer ', '')
        if (!token || token.trim() === '') {
          throw new Error('Token de autorización vacío')
        }
        
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !authUser) {
          console.error('❌ [outlook-auth] Usuario no autenticado en get_auth_url')
          throw new Error('Debe estar autenticado para obtener URL de autorización')
        }
        
        console.log('✅ [outlook-auth] Usuario autenticado para get_auth_url:', authUser.id)
        
        const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
          `client_id=${clientId}&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_mode=query&` +
          `scope=${encodeURIComponent(scope)}&` +
          `prompt=consent&` +
          `access_type=offline`

        console.log('🔗 [outlook-auth] URL generada exitosamente')

        return new Response(
          JSON.stringify({ auth_url: authUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'exchange_code': {
        console.log('🔄 [outlook-auth] Iniciando exchange_code...')
        console.log('📝 [outlook-auth] Datos recibidos:', { code: code ? 'PRESENTE' : 'AUSENTE' })
        
        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
        
        const body = new URLSearchParams({
          client_id: clientId,
          scope: scope,
          code: code!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          client_secret: clientSecret
        })

        console.log('🌐 [outlook-auth] Llamando a Microsoft para tokens...')
        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        })

        const tokenData = await tokenResponse.json()
        console.log('🎟️ [outlook-auth] Respuesta de tokens:', { 
          success: !tokenData.error, 
          error: tokenData.error || 'NINGUNO',
          hasAccessToken: !!tokenData.access_token,
          hasRefreshToken: !!tokenData.refresh_token,
          expiresIn: tokenData.expires_in
        })

        if (tokenData.error) {
          console.error('❌ [outlook-auth] Error OAuth:', tokenData.error_description)
          throw new Error(`OAuth error: ${tokenData.error_description}`)
        }

        // Obtener info del usuario de Microsoft Graph
        console.log('👤 [outlook-auth] Obteniendo información del usuario...')
        const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        })
        const userData = await userResponse.json()
        console.log('📧 [outlook-auth] Usuario obtenido:', { 
          mail: userData.mail, 
          userPrincipalName: userData.userPrincipalName,
          displayName: userData.displayName
        })

        // Obtener el usuario autenticado y su org_id
        console.log('🔐 [outlook-auth] Verificando usuario autenticado...')
        const authHeader = req.headers.get('Authorization')
        console.log('🎫 [outlook-auth] Auth header:', { 
          present: !!authHeader,
          length: authHeader?.length || 0,
          startsWithBearer: authHeader?.startsWith('Bearer ') || false
        })
        
        if (!authHeader) {
          console.error('❌ [outlook-auth] No authorization header provided')
          throw new Error('Header de autorización requerido')
        }
        
        if (!authHeader.startsWith('Bearer ')) {
          console.error('❌ [outlook-auth] Invalid authorization header format')
          throw new Error('Formato de header de autorización inválido')
        }
        
        const token = authHeader.replace('Bearer ', '')
        if (!token || token.trim() === '') {
          console.error('❌ [outlook-auth] Empty token in authorization header')
          throw new Error('Token de autorización vacío')
        }
        
        console.log('🔍 [outlook-auth] Token extraído:', { length: token.length })
        
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
        
        if (authError) {
          console.error('❌ [outlook-auth] Error obteniendo usuario:', authError)
          throw new Error(`Error de autenticación: ${authError.message}`)
        }
        
        if (!authUser) {
          console.error('❌ [outlook-auth] Usuario no autenticado - token inválido o expirado')
          throw new Error('Token de autenticación inválido o expirado')
        }
        
        console.log('✅ [outlook-auth] Usuario autenticado:', authUser.id)

        // Obtener org_id del usuario
        console.log('🏢 [outlook-auth] Obteniendo organización del usuario...')
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', authUser.id)
          .single()

        if (profileError) {
          console.error('❌ [outlook-auth] Error obteniendo perfil:', profileError)
          throw new Error(`Error obteniendo perfil: ${profileError.message}`)
        }

        if (!userProfile?.org_id) {
          console.error('❌ [outlook-auth] Usuario sin organización')
          throw new Error('Usuario sin organización asignada')
        }
        
        console.log('✅ [outlook-auth] Organización encontrada:', userProfile.org_id)

        // Validar datos necesarios antes de guardar
        if (!tokenData.access_token) {
          console.error('❌ [outlook-auth] Access token faltante')
          throw new Error('Access token no recibido de Microsoft')
        }

        if (!userData.mail && !userData.userPrincipalName) {
          console.error('❌ [outlook-auth] Email del usuario no disponible')
          throw new Error('No se pudo obtener el email del usuario')
        }

        // Log refresh token status
        console.log('🔄 [outlook-auth] Refresh token status:', {
          received: !!tokenData.refresh_token,
          note: !tokenData.refresh_token ? 'No refresh token - Microsoft might not provide one for this flow' : 'Refresh token received'
        })

        // Guardar tokens en la base de datos
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
        
        console.log('🔐 [outlook-auth] Preparando tokens para almacenamiento...')
        const encryptedAccessToken = btoa(tokenData.access_token)
        const encryptedRefreshToken = tokenData.refresh_token ? btoa(tokenData.refresh_token) : null
        
        const tokenRecord = {
          user_id: authUser.id,
          org_id: userProfile.org_id,
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken,
          token_expires_at: expiresAt.toISOString(),
          scope_permissions: tokenData.scope ? tokenData.scope.split(' ') : [],
          outlook_email: userData.mail || userData.userPrincipalName,
          is_active: true,
          last_used_at: new Date().toISOString()
        }
        
        console.log('💾 [outlook-auth] Insertando token en BD...', {
          userId: tokenRecord.user_id,
          orgId: tokenRecord.org_id,
          outlookEmail: tokenRecord.outlook_email,
          expiresAt: tokenRecord.token_expires_at,
          scopeCount: tokenRecord.scope_permissions.length,
          hasRefreshToken: !!tokenRecord.refresh_token_encrypted
        })
        
        // Usar el service role client para bypass RLS
        const { data: userToken, error: insertError } = await supabase
          .from('user_outlook_tokens')
          .upsert(tokenRecord, {
            onConflict: 'user_id,org_id'
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('❌ [outlook-auth] Error insertando token:', insertError)
          console.error('🔍 [outlook-auth] Registro que falló:', tokenRecord)
          throw new Error(`Error guardando token: ${insertError.message}`)
        }
        
        console.log('✅ [outlook-auth] Token insertado exitosamente:', {
          tokenId: userToken?.id,
          userId: authUser.id,
          orgId: userProfile.org_id,
          outlookEmail: userData.mail || userData.userPrincipalName
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            user_email: userData.mail || userData.userPrincipalName,
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
        const encryptedRefreshToken = tokenData.refresh_token ? btoa(tokenData.refresh_token) : null
        
        // Obtener el usuario autenticado
        const authHeader = req.headers.get('Authorization')
        const { data: { user: authUser } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
        
        if (!authUser) {
          throw new Error('Usuario no autenticado')
        }

        const updateData: any = {
          access_token_encrypted: encryptedAccessToken,
          token_expires_at: expiresAt.toISOString()
        }
        
        // Solo actualizar refresh token si se recibió uno nuevo
        if (encryptedRefreshToken) {
          updateData.refresh_token_encrypted = encryptedRefreshToken
        }

        const { data } = await supabase
          .from('user_outlook_tokens')
          .update(updateData)
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
    console.error('❌ [outlook-auth] Error crítico:', error)
    console.error('🔍 [outlook-auth] Stack trace:', error.stack)
    console.error('🔍 [outlook-auth] Error type:', typeof error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        function: 'outlook-auth'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
