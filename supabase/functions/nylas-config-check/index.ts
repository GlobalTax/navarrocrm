
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const nylasApiKey = Deno.env.get('NYLAS_API_KEY')
    const nylasApplicationId = Deno.env.get('NYLAS_APPLICATION_ID')
    const nylasApiUri = Deno.env.get('NYLAS_API_URI') || 'https://api.us.nylas.com'
    
    // Construir la redirect_uri correcta usando la URL base de la aplicación
    const baseUrl = req.headers.get('origin') || 'https://9142507d-4b1f-4f46-bca7-16102ac6aa30.lovableproject.com'
    const redirectUri = `${baseUrl}/nylas/callback`

    console.log('🔧 [Nylas Config Check] Configuration Status:', {
      hasApiKey: !!nylasApiKey,
      apiKeyLength: nylasApiKey ? nylasApiKey.length : 0,
      hasApplicationId: !!nylasApplicationId,
      applicationId: nylasApplicationId?.substring(0, 8) + '...',
      apiUri: nylasApiUri,
      redirectUri,
      baseUrl
    })

    // Verificar que las variables estén configuradas
    const configStatus = {
      hasApiKey: !!nylasApiKey,
      hasAppId: !!nylasApplicationId,
      apiUri: nylasApiUri,
      redirectUri: redirectUri,
      errors: [] as string[]
    }

    if (!nylasApiKey) {
      configStatus.errors.push('NYLAS_API_KEY no está configurado')
    }

    if (!nylasApplicationId) {
      configStatus.errors.push('NYLAS_APPLICATION_ID no está configurado')
    }

    // Si hay API key, intentar verificar que sea válida
    if (nylasApiKey) {
      try {
        const testResponse = await fetch(`${nylasApiUri}/v3/applications`, {
          headers: {
            'Authorization': `Bearer ${nylasApiKey}`,
            'Accept': 'application/json',
          }
        })

        if (!testResponse.ok) {
          configStatus.errors.push(`API Key parece inválida (HTTP ${testResponse.status})`)
        } else {
          console.log('✅ [Nylas Config Check] API Key verification successful')
        }
      } catch (error) {
        configStatus.errors.push(`Error verificando API Key: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify(configStatus),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ [Nylas Config Check] Error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Error verificando configuración',
        hasApiKey: false,
        hasAppId: false,
        errors: ['Error interno verificando configuración']
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
