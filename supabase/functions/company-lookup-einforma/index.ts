
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

interface EInformaTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface EInformaCompanyResponse {
  denominacion: string
  nif: string
  domicilioSocial?: {
    direccion?: string
    localidad?: string
    codigoPostal?: string
  }
  actividadPrincipal?: string
  situacion?: string
  administradores?: Array<{
    nombre?: string
  }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 [company-lookup] Iniciando función de búsqueda empresarial')
    
    // Validar el body de la request
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('❌ [company-lookup] Error parseando JSON:', parseError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'INVALID_JSON',
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
        error: 'INVALID_NIF',
        message: 'Por favor, introduce un NIF/CIF válido'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cleanNif = nif.trim().toUpperCase()
    console.log('🔍 [company-lookup] Procesando búsqueda para NIF:', cleanNif)

    // Validar formato NIF/CIF
    if (!isValidNifCif(cleanNif)) {
      console.log('❌ [company-lookup] Formato NIF/CIF inválido:', cleanNif)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'INVALID_FORMAT',
        message: 'El formato del NIF/CIF introducido no es válido. Debe ser formato español (ej: B12345678, 12345678Z, X1234567L)'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verificar credenciales
    if (!eInformaClientId || !eInformaClientSecret) {
      console.error('❌ [company-lookup] Credenciales de eInforma no configuradas')
      
      const mockCompanyData = generateMockCompanyData(cleanNif)
      
      return new Response(JSON.stringify({
        success: true,
        data: mockCompanyData,
        message: 'Empresa encontrada (datos simulados - credenciales no configuradas)',
        isSimulated: true,
        warning: 'Las credenciales de eInforma no están configuradas. Contacta con el administrador del sistema.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ [company-lookup] Credenciales configuradas, consultando eInforma...')

    try {
      // Obtener token de acceso de eInforma
      const accessToken = await getEInformaAccessToken()
      console.log('✅ [company-lookup] Token de acceso obtenido exitosamente')

      // Buscar empresa en eInforma
      const companyData = await searchCompanyInEInforma(cleanNif, accessToken)
      
      if (!companyData) {
        console.log('❌ [company-lookup] Empresa no encontrada en eInforma')
        return new Response(JSON.stringify({
          success: false,
          error: 'COMPANY_NOT_FOUND',
          message: 'No se encontró ninguna empresa con este NIF/CIF en el Registro Mercantil'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('✅ [company-lookup] Empresa encontrada en eInforma:', companyData.name)

      return new Response(JSON.stringify({
        success: true,
        data: companyData,
        message: 'Empresa encontrada en el Registro Mercantil',
        isSimulated: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (eInformaError) {
      console.error('❌ [company-lookup] Error consultando eInforma:', eInformaError)
      
      // Como fallback, devolver datos simulados con advertencia
      console.log('⚠️ [company-lookup] Usando datos simulados como fallback')
      const mockCompanyData = generateMockCompanyData(cleanNif)
      
      return new Response(JSON.stringify({
        success: true,
        data: mockCompanyData,
        message: 'Empresa encontrada (datos simulados - error de conexión)',
        isSimulated: true,
        warning: `Error de conexión con eInforma: ${eInformaError.message}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error('❌ [company-lookup] Error general:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor. Inténtalo de nuevo más tarde.',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function getEInformaAccessToken(): Promise<string> {
  console.log('🔑 [company-lookup] Obteniendo token de acceso de eInforma...')
  
  // URL CORREGIDA - Portal de desarrolladores de eInforma
  const tokenUrl = 'https://developers.einforma.com/api/v1/oauth/token'
  
  const requestBody = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: eInformaClientId!,
    client_secret: eInformaClientSecret!,
    scope: 'api_auth'
  })

  console.log('🔍 [company-lookup] Enviando request a:', tokenUrl)

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: requestBody
  })

  console.log('📥 [company-lookup] Response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ [company-lookup] Error obteniendo token:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    
    if (response.status === 401) {
      throw new Error('INVALID_CREDENTIALS: Las credenciales de eInforma no son válidas')
    } else if (response.status === 400) {
      throw new Error('BAD_REQUEST: Error en los parámetros de autenticación')
    } else {
      throw new Error(`OAUTH_ERROR: ${response.status} - ${errorText}`)
    }
  }

  const tokenData: EInformaTokenResponse = await response.json()
  console.log('✅ [company-lookup] Token obtenido exitosamente')
  
  return tokenData.access_token
}

async function searchCompanyInEInforma(nif: string, accessToken: string): Promise<CompanyData | null> {
  console.log('🔍 [company-lookup] Buscando empresa en eInforma:', nif)
  
  // URL CORREGIDA - GET directo por NIF según la documentación
  const searchUrl = `https://developers.einforma.com/api/v1/companies/${nif}`
  
  console.log('🔍 [company-lookup] Enviando request GET a:', searchUrl)

  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })

  console.log('📥 [company-lookup] Search response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ [company-lookup] Error buscando empresa:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    
    if (response.status === 404) {
      return null // Empresa no encontrada
    } else if (response.status === 401) {
      throw new Error('TOKEN_EXPIRED: El token de acceso ha expirado')
    } else if (response.status === 403) {
      throw new Error('ACCESS_DENIED: No tienes permisos para consultar esta empresa')
    } else {
      throw new Error(`SEARCH_ERROR: ${response.status} - ${errorText}`)
    }
  }

  const searchResult: EInformaCompanyResponse = await response.json()
  console.log('📥 [company-lookup] Respuesta de eInforma:', {
    denominacion: searchResult.denominacion,
    nif: searchResult.nif,
    situacion: searchResult.situacion
  })

  if (!searchResult.denominacion) {
    console.log('❌ [company-lookup] Sin datos válidos en respuesta de eInforma')
    return null
  }
  
  // Convertir datos de eInforma a nuestro formato
  const companyData: CompanyData = {
    name: searchResult.denominacion || 'Nombre no disponible',
    nif: searchResult.nif || nif,
    address_street: searchResult.domicilioSocial?.direccion,
    address_city: searchResult.domicilioSocial?.localidad,
    address_postal_code: searchResult.domicilioSocial?.codigoPostal,
    business_sector: searchResult.actividadPrincipal,
    legal_representative: searchResult.administradores?.[0]?.nombre,
    status: searchResult.situacion === 'ACTIVA' ? 'activo' : 'inactivo',
    client_type: 'empresa'
  }

  console.log('✅ [company-lookup] Datos convertidos exitosamente')
  return companyData
}

function generateMockCompanyData(nif: string): CompanyData {
  // Generar datos simulados basados en el NIF para testing (fallback)
  const mockCompanies: Record<string, Partial<CompanyData>> = {
    'B67261552': {
      name: 'TECNOLOGÍA AVANZADA S.L.',
      business_sector: 'Servicios informáticos',
      address_street: 'Calle Gran Vía, 123',
      address_city: 'Madrid',
      address_postal_code: '28013',
      legal_representative: 'Juan García López'
    },
    'A08663619': {
      name: 'CONSULTORÍA EMPRESARIAL S.A.',
      business_sector: 'Consultoría de gestión empresarial',
      address_street: 'Avenida Diagonal, 456',
      address_city: 'Barcelona',
      address_postal_code: '08029',
      legal_representative: 'María Rodríguez Fernández'
    }
  }

  const mockData = mockCompanies[nif] || {
    name: `EMPRESA EJEMPLO ${nif.slice(-4)} S.L.`,
    business_sector: 'Actividades empresariales',
    address_street: 'Calle Principal, 1',
    address_city: 'Madrid',
    address_postal_code: '28001',
    legal_representative: 'Representante Legal'
  }

  return {
    name: mockData.name!,
    nif: nif,
    address_street: mockData.address_street,
    address_city: mockData.address_city,
    address_postal_code: mockData.address_postal_code,
    business_sector: mockData.business_sector,
    legal_representative: mockData.legal_representative,
    status: 'activo',
    client_type: 'empresa'
  }
}

function isValidNifCif(nif: string): boolean {
  if (!nif || typeof nif !== 'string') return false
  
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  
  // Patrones de validación
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
