
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const eInformaClientId = Deno.env.get('EINFORMA_CLIENT_ID')
const eInformaClientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET')

interface CompanyData {
  name: string
  nif: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  business_sector?: string
  legal_representative?: string
  status: 'activo' | 'inactivo'
  client_type: 'empresa'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 [company-lookup] Iniciando función de búsqueda empresarial')
    
    // Verificar credenciales de forma más detallada
    if (!eInformaClientId || !eInformaClientSecret) {
      console.error('❌ [company-lookup] Credenciales faltantes:', {
        hasClientId: !!eInformaClientId,
        hasClientSecret: !!eInformaClientSecret,
        clientIdLength: eInformaClientId?.length || 0,
        clientSecretLength: eInformaClientSecret?.length || 0
      })
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Credenciales no configuradas',
        message: 'Las credenciales de eInforma no están configuradas correctamente. Verifica EINFORMA_CLIENT_ID y EINFORMA_CLIENT_SECRET en los secretos de Supabase.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('🔑 [company-lookup] Credenciales verificadas:', {
      clientId: eInformaClientId.substring(0, 8) + '***',
      clientSecret: eInformaClientSecret.substring(0, 8) + '***',
      clientIdLength: eInformaClientId.length,
      clientSecretLength: eInformaClientSecret.length
    })

    // Validar el body de la request
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('❌ [company-lookup] Error parseando JSON:', parseError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON',
        message: 'El formato de la solicitud no es válido'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { nif } = requestBody
    
    if (!nif || typeof nif !== 'string' || !nif.trim()) {
      console.log('❌ [company-lookup] NIF no válido:', nif)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'NIF requerido',
        message: 'Por favor, introduce un NIF/CIF válido'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('🔍 [company-lookup] Procesando búsqueda para NIF:', nif)

    // Validar formato NIF/CIF
    const cleanNif = nif.trim().toUpperCase()
    if (!isValidNifCif(cleanNif)) {
      console.log('❌ [company-lookup] Formato NIF/CIF inválido:', cleanNif)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Formato inválido',
        message: 'El formato del NIF/CIF introducido no es válido. Debe ser formato español (ej: B12345678, 12345678Z, X1234567L)'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ [company-lookup] Formato NIF válido, consultando eInforma...')

    // Obtener datos de la empresa
    const companyData = await fetchCompanyData(cleanNif)
    
    console.log('✅ [company-lookup] Datos obtenidos exitosamente para:', cleanNif)

    return new Response(JSON.stringify({
      success: true,
      data: companyData,
      message: 'Empresa encontrada correctamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ [company-lookup] Error general:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Error interno',
      message: getErrorMessage(error.message),
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function fetchCompanyData(nif: string): Promise<CompanyData> {
  try {
    console.log('🔑 [company-lookup] Iniciando proceso de autenticación OAuth...')
    
    // Preparar las credenciales para Basic Auth
    const credentials = btoa(`${eInformaClientId}:${eInformaClientSecret}`)
    console.log('🔐 [company-lookup] Credenciales Basic Auth preparadas')
    
    // Preparar el body para el request de token
    const tokenBody = new URLSearchParams({
      'grant_type': 'client_credentials',
      'scope': 'api_auth'
    })
    
    console.log('📡 [company-lookup] Solicitando token OAuth a eInforma...')
    console.log('🔗 [company-lookup] URL:', 'https://developers.einforma.com/api/v1/oauth/token')
    console.log('📋 [company-lookup] Parámetros:', tokenBody.toString())
    
    // Obtener token de acceso
    const tokenResponse = await fetch('https://developers.einforma.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'User-Agent': 'CRM-Sistema/1.0'
      },
      body: tokenBody.toString()
    })

    console.log('📊 [company-lookup] Respuesta OAuth:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ [company-lookup] Error OAuth:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorBody: errorText
      })
      
      if (tokenResponse.status === 401) {
        throw new Error('INVALID_CREDENTIALS')
      } else if (tokenResponse.status === 400) {
        throw new Error(`OAUTH_ERROR: ${errorText}`)
      } else {
        throw new Error(`HTTP_ERROR: ${tokenResponse.status} - ${errorText}`)
      }
    }

    const tokenData = await tokenResponse.json()
    console.log('📋 [company-lookup] Token OAuth obtenido:', {
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope
    })
    
    const accessToken = tokenData.access_token
    
    if (!accessToken) {
      console.error('❌ [company-lookup] Token vacío en respuesta:', tokenData)
      throw new Error('TOKEN_MISSING')
    }
    
    console.log('✅ [company-lookup] Token OAuth válido obtenido')

    // Buscar empresa
    console.log('🔍 [company-lookup] Buscando empresa con NIF:', nif)
    
    const searchUrl = `https://developers.einforma.com/api/v1/companies/search?nif=${encodeURIComponent(nif)}`
    console.log('📡 [company-lookup] URL de búsqueda:', searchUrl)
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'CRM-Sistema/1.0'
      }
    })

    console.log('📊 [company-lookup] Respuesta búsqueda:', {
      status: searchResponse.status,
      statusText: searchResponse.statusText
    })

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('❌ [company-lookup] Error en búsqueda:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        errorBody: errorText
      })
      
      if (searchResponse.status === 404) {
        throw new Error('COMPANY_NOT_FOUND')
      } else if (searchResponse.status === 401) {
        throw new Error('TOKEN_EXPIRED')
      } else {
        throw new Error(`SEARCH_ERROR: ${searchResponse.status} - ${errorText}`)
      }
    }

    const searchData = await searchResponse.json()
    console.log('📋 [company-lookup] Datos de búsqueda recibidos:', {
      hasCompanies: !!searchData.companies,
      companiesCount: searchData.companies?.length || 0,
      totalResults: searchData.total || 0
    })
    
    if (!searchData.companies || searchData.companies.length === 0) {
      console.log('ℹ️ [company-lookup] No se encontraron empresas para NIF:', nif)
      throw new Error('COMPANY_NOT_FOUND')
    }

    const company = searchData.companies[0]
    console.log('📋 [company-lookup] Datos de empresa encontrada:', {
      name: company.name,
      tradeName: company.tradeName,
      status: company.status,
      hasAddress: !!company.address
    })
    
    // Transformar datos al formato esperado
    const transformedData = {
      name: company.name || company.tradeName || company.commercialName || 'Empresa no identificada',
      nif: nif,
      address_street: formatAddress(company.address),
      address_city: company.address?.city || company.address?.locality || '',
      address_postal_code: company.address?.postalCode || company.address?.zipCode || '',
      business_sector: company.sector || company.cnae?.description || company.activity || '',
      legal_representative: formatLegalRepresentative(company.administrators || company.representatives),
      status: (company.status === 'ACTIVE' || company.status === 'active') ? 'activo' as const : 'inactivo' as const,
      client_type: 'empresa' as const
    }
    
    console.log('✅ [company-lookup] Datos transformados correctamente')
    return transformedData
    
  } catch (error) {
    console.error('❌ [company-lookup] Error en fetchCompanyData:', {
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

function isValidNifCif(nif: string): boolean {
  if (!nif || typeof nif !== 'string') return false
  
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  
  // Patrones de validación mejorados
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  const isValid = nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  
  console.log('🔍 [company-lookup] Validación formato:', {
    nif: cleanNif,
    isNif: nifRegex.test(cleanNif),
    isCif: cifRegex.test(cleanNif),
    isNie: nieRegex.test(cleanNif),
    isValid
  })
  
  return isValid
}

function formatAddress(address: any): string {
  if (!address) return ''
  
  const parts = []
  if (address.street || address.streetName) parts.push(address.street || address.streetName)
  if (address.number || address.streetNumber) parts.push(address.number || address.streetNumber)
  if (address.floor) parts.push(`Piso ${address.floor}`)
  if (address.door) parts.push(`Puerta ${address.door}`)
  
  return parts.join(', ')
}

function formatLegalRepresentative(representatives: any[]): string {
  if (!representatives || representatives.length === 0) return ''
  
  const active = representatives.find(rep => rep.status === 'ACTIVE' || rep.status === 'active')
  if (active) {
    return `${active.name || ''} ${active.surname || active.lastName || ''}`.trim()
  }
  
  const first = representatives[0]
  return `${first.name || ''} ${first.surname || first.lastName || ''}`.trim()
}

function getErrorMessage(error: string): string {
  console.log('🔍 [company-lookup] Generando mensaje de error para:', error)
  
  switch (error) {
    case 'COMPANY_NOT_FOUND':
      return 'No se encontró ninguna empresa con este NIF/CIF en el Registro Mercantil oficial'
    case 'INVALID_CREDENTIALS':
      return 'Las credenciales de eInforma no son válidas. Verifica la configuración en el panel de administración'
    case 'TOKEN_MISSING':
    case 'TOKEN_EXPIRED':
      return 'Error de autenticación con eInforma. Verifica las credenciales y vuelve a intentarlo'
    default:
      if (error?.includes('OAUTH_ERROR')) {
        return 'Error de autenticación OAuth con eInforma. Verifica las credenciales'
      } else if (error?.includes('SEARCH_ERROR')) {
        return 'Error al consultar los datos empresariales. Inténtalo de nuevo'
      } else if (error?.includes('HTTP_ERROR')) {
        return 'Error de conexión con el servicio eInforma. Inténtalo más tarde'
      }
      return 'Error al consultar los datos empresariales. Si el problema persiste, contacta con el administrador'
  }
}
