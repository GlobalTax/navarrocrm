
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
    // Obtener token de acceso
    const tokenResponse = await fetch('https://api.einforma.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${eInformaClientId}:${eInformaClientSecret}`)}`
      },
      body: 'grant_type=client_credentials&scope=read'
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ [company-lookup] Error obteniendo token:', errorText)
      throw new Error('Error de autenticación con eInforma')
    }

    const { access_token } = await tokenResponse.json()
    console.log('✅ [company-lookup] Token obtenido')

    // Buscar empresa
    const searchResponse = await fetch(
      `https://api.einforma.com/v1/companies/search?nif=${encodeURIComponent(nif)}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!searchResponse.ok) {
      if (searchResponse.status === 404) {
        throw new Error('COMPANY_NOT_FOUND')
      }
      throw new Error(`Error consultando eInforma: ${searchResponse.status}`)
    }

    const data = await searchResponse.json()
    
    if (!data.companies || data.companies.length === 0) {
      throw new Error('COMPANY_NOT_FOUND')
    }

    const company = data.companies[0]
    
    // Transformar datos
    return {
      name: company.name || company.tradeName || '',
      nif: nif,
      address_street: formatAddress(company.address),
      address_city: company.address?.city || '',
      address_postal_code: company.address?.postalCode || '',
      business_sector: company.sector || company.cnae?.description || '',
      legal_representative: formatLegalRepresentative(company.administrators),
      status: company.status === 'ACTIVE' ? 'activo' : 'inactivo',
      client_type: 'empresa'
    }
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
  if (address.street) parts.push(address.street)
  if (address.number) parts.push(address.number)
  if (address.floor) parts.push(`Piso ${address.floor}`)
  if (address.door) parts.push(`Puerta ${address.door}`)
  
  return parts.join(', ')
}

function formatLegalRepresentative(administrators: any[]): string {
  if (!administrators || administrators.length === 0) return ''
  
  const active = administrators.find(admin => admin.status === 'ACTIVE')
  if (active) {
    return `${active.name || ''} ${active.surname || ''}`.trim()
  }
  
  const first = administrators[0]
  return `${first.name || ''} ${first.surname || ''}`.trim()
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'COMPANY_NOT_FOUND':
      return 'No se encontró ninguna empresa con este NIF/CIF en el Registro Mercantil'
    case 'Formato inválido':
      return 'El formato del NIF/CIF introducido no es válido. Verifica que esté bien escrito'
    case 'Credenciales no configuradas':
      return 'Error de configuración del servicio. Contacta con el administrador'
    default:
      return 'Error al consultar los datos empresariales. Inténtalo de nuevo'
  }
}
