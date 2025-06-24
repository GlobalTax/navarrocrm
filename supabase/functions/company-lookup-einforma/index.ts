
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
  name: string
  nif: string
  address?: string
  city?: string
  postal_code?: string
  activity?: string
  status?: string
  legal_rep?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 [company-lookup] Iniciando función de búsqueda empresarial')
    
    // Verificar credenciales con información detallada
    if (!eInformaClientId || !eInformaClientSecret) {
      console.error('❌ [company-lookup] Credenciales faltantes:', {
        hasClientId: !!eInformaClientId,
        hasClientSecret: !!eInformaClientSecret,
        envKeys: Object.keys(Deno.env.toObject()).filter(k => k.includes('EINFORMA'))
      })
      
      // Devolver datos simulados con advertencia sobre credenciales
      const { nif } = await req.json()
      if (!nif) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'INVALID_NIF',
          message: 'NIF/CIF requerido'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const cleanNif = nif.trim().toUpperCase()
      if (!isValidNifCif(cleanNif)) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'INVALID_FORMAT',
          message: 'El formato del NIF/CIF no es válido'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log('⚠️ [company-lookup] Credenciales no configuradas, usando datos simulados')
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

    console.log('✅ [company-lookup] Formato NIF válido, consultando eInforma...')

    try {
      // Obtener token de acceso de eInforma
      const accessToken = await getEInformaAccessToken()
      console.log('✅ [company-lookup] Token de acceso obtenido')

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
        message: 'Empresa encontrada (datos simulados - error de conexión con eInforma)',
        isSimulated: true,
        warning: 'No se pudo conectar con eInforma. Se muestran datos de prueba.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error('❌ [company-lookup] Error general:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'INTERNAL_ERROR',
      message: getErrorMessage(error.message),
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function getEInformaAccessToken(): Promise<string> {
  console.log('🔑 [company-lookup] Obteniendo token de acceso de eInforma...')
  
  // URL corregida de la API de eInforma para OAuth
  const tokenUrl = 'https://www.einforma.com/servlet/api/oauth/token'
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: eInformaClientId!,
      client_secret: eInformaClientSecret!
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ [company-lookup] Error obteniendo token:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    throw new Error(`OAUTH_ERROR: ${response.status} - ${errorText}`)
  }

  const tokenData: EInformaTokenResponse = await response.json()
  console.log('✅ [company-lookup] Token obtenido exitosamente')
  
  return tokenData.access_token
}

async function searchCompanyInEInforma(nif: string, accessToken: string): Promise<CompanyData | null> {
  console.log('🔍 [company-lookup] Buscando empresa en eInforma:', nif)
  
  // URL corregida de la API de eInforma para búsqueda de empresas
  const searchUrl = `https://www.einforma.com/servlet/api/search/companies`
  
  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      nif: nif,
      fields: ['name', 'nif', 'address', 'city', 'postal_code', 'activity', 'status', 'legal_rep']
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ [company-lookup] Error buscando empresa:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    
    if (response.status === 404) {
      return null // Empresa no encontrada
    }
    
    throw new Error(`SEARCH_ERROR: ${response.status} - ${errorText}`)
  }

  const searchResult = await response.json()
  console.log('📥 [company-lookup] Respuesta de eInforma:', searchResult)

  if (!searchResult || !searchResult.companies || searchResult.companies.length === 0) {
    console.log('❌ [company-lookup] Sin resultados en eInforma')
    return null
  }

  const companyInfo: EInformaCompanyResponse = searchResult.companies[0]
  
  // Convertir datos de eInforma a nuestro formato
  const companyData: CompanyData = {
    name: companyInfo.name || 'Nombre no disponible',
    nif: companyInfo.nif || nif,
    address_street: companyInfo.address,
    address_city: companyInfo.city,
    address_postal_code: companyInfo.postal_code,
    business_sector: companyInfo.activity,
    legal_representative: companyInfo.legal_rep,
    status: companyInfo.status === 'ACTIVA' ? 'activo' : 'inactivo',
    client_type: 'empresa'
  }

  console.log('✅ [company-lookup] Datos convertidos:', companyData)
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

function getErrorMessage(error: string): string {
  console.log('🔍 [company-lookup] Generando mensaje de error para:', error)
  
  switch (error) {
    case 'COMPANY_NOT_FOUND':
      return 'No se encontró ninguna empresa con este NIF/CIF en el Registro Mercantil oficial'
    case 'INVALID_CREDENTIALS':
      return 'Las credenciales de eInforma no son válidas. Verifica que el CLIENT_ID y CLIENT_SECRET sean correctos'
    case 'TOKEN_MISSING':
    case 'TOKEN_EXPIRED':
      return 'Error de autenticación con eInforma. Verifica las credenciales'
    case 'CREDENTIALS_MISSING':
      return 'Credenciales de eInforma no configuradas en el sistema'
    case 'INVALID_NIF':
      return 'El NIF/CIF introducido no es válido'
    case 'INVALID_FORMAT':
      return 'El formato del NIF/CIF no es correcto'
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
