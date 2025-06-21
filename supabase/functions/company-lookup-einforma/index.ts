
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
    console.log('🚀 [company-lookup] Iniciando función')
    
    // Verificar credenciales primero
    if (!eInformaClientId || !eInformaClientSecret) {
      console.error('❌ [company-lookup] Credenciales de eInforma no configuradas')
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Credenciales no configuradas',
        message: 'Error de configuración del servicio. Contacta con el administrador'
      }), {
        status: 500,
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
        error: 'Invalid JSON',
        message: 'Datos de solicitud inválidos'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { nif } = requestBody
    
    if (!nif || typeof nif !== 'string' || !nif.trim()) {
      console.log('❌ [company-lookup] NIF no proporcionado o inválido')
      return new Response(JSON.stringify({ 
        success: false,
        error: 'NIF requerido',
        message: 'Por favor, introduce un NIF/CIF válido'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('🔍 [company-lookup] Buscando empresa con NIF:', nif)

    // Validar formato NIF/CIF
    const cleanNif = nif.trim().toUpperCase()
    if (!isValidNifCif(cleanNif)) {
      console.log('❌ [company-lookup] Formato NIF/CIF inválido:', cleanNif)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Formato inválido',
        message: 'El formato del NIF/CIF introducido no es válido. Verifica que esté bien escrito'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ [company-lookup] Formato válido, consultando eInforma...')

    // Obtener datos de la empresa
    const companyData = await fetchCompanyData(cleanNif)
    
    console.log('✅ [company-lookup] Datos obtenidos exitosamente')

    return new Response(JSON.stringify({
      success: true,
      data: companyData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ [company-lookup] Error general:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Error interno',
      message: getErrorMessage(error.message)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function fetchCompanyData(nif: string): Promise<CompanyData> {
  try {
    console.log('🔑 [company-lookup] Obteniendo token de acceso...')
    
    // Obtener token de acceso con la URL correcta de eInforma
    const tokenResponse = await fetch('https://developers.einforma.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${eInformaClientId}:${eInformaClientSecret}`)}`
      },
      body: 'grant_type=client_credentials&scope=api_auth'
    })

    console.log('📊 [company-lookup] Respuesta de token - Status:', tokenResponse.status)

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ [company-lookup] Error obteniendo token:', errorText)
      throw new Error('Error de autenticación con eInforma')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    
    if (!accessToken) {
      console.error('❌ [company-lookup] Token no recibido en respuesta:', tokenData)
      throw new Error('Token de acceso no válido')
    }
    
    console.log('✅ [company-lookup] Token obtenido correctamente')

    // Buscar empresa con la URL correcta
    console.log('🔍 [company-lookup] Buscando empresa con NIF:', nif)
    
    const searchResponse = await fetch(
      `https://developers.einforma.com/api/v1/companies/search?nif=${encodeURIComponent(nif)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('📊 [company-lookup] Respuesta de búsqueda - Status:', searchResponse.status)

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('❌ [company-lookup] Error en búsqueda:', errorText)
      
      if (searchResponse.status === 404) {
        throw new Error('COMPANY_NOT_FOUND')
      }
      throw new Error(`Error consultando eInforma: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    console.log('📋 [company-lookup] Datos recibidos:', JSON.stringify(searchData, null, 2))
    
    if (!searchData.companies || searchData.companies.length === 0) {
      throw new Error('COMPANY_NOT_FOUND')
    }

    const company = searchData.companies[0]
    
    // Transformar datos al formato esperado
    const transformedData = {
      name: company.name || company.tradeName || company.commercialName || '',
      nif: nif,
      address_street: formatAddress(company.address),
      address_city: company.address?.city || company.address?.locality || '',
      address_postal_code: company.address?.postalCode || company.address?.zipCode || '',
      business_sector: company.sector || company.cnae?.description || company.activity || '',
      legal_representative: formatLegalRepresentative(company.administrators || company.representatives),
      status: (company.status === 'ACTIVE' || company.status === 'active') ? 'activo' : 'inactivo',
      client_type: 'empresa' as const
    }
    
    console.log('✅ [company-lookup] Datos transformados:', transformedData)
    return transformedData
    
  } catch (error) {
    console.error('❌ [company-lookup] Error en fetchCompanyData:', error)
    throw error
  }
}

function isValidNifCif(nif: string): boolean {
  if (!nif || typeof nif !== 'string') return false
  
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  
  // Patrones básicos
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  return nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
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
  switch (error) {
    case 'COMPANY_NOT_FOUND':
      return 'No se encontró ninguna empresa con este NIF/CIF en el Registro Mercantil'
    case 'Formato inválido':
      return 'El formato del NIF/CIF introducido no es válido. Verifica que esté bien escrito'
    case 'Credenciales no configuradas':
      return 'Error de configuración del servicio. Contacta con el administrador'
    case 'Error de autenticación con eInforma':
      return 'Error de autenticación con el servicio eInforma. Verifica las credenciales'
    case 'Token de acceso no válido':
      return 'Error obteniendo token de acceso. Verifica las credenciales'
    default:
      return 'Error al consultar los datos empresariales. Inténtalo de nuevo'
  }
}
