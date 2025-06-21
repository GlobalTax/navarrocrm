
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const eInformaClientId = Deno.env.get('EINFORMA_CLIENT_ID')!
const eInformaClientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET')!

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
    const { nif } = await req.json()
    
    if (!nif) {
      throw new Error('NIF/CIF es requerido')
    }

    console.log('🔍 Buscando empresa con NIF:', nif)

    // Validar formato NIF/CIF español
    if (!isValidNifCif(nif)) {
      throw new Error('Formato de NIF/CIF inválido')
    }

    // Obtener token de acceso de eInforma
    const accessToken = await getEInformaAccessToken()
    
    // Buscar empresa en eInforma API
    const companyData = await searchCompanyByNif(nif, accessToken)
    
    console.log('✅ Datos de empresa encontrados:', companyData)

    return new Response(JSON.stringify({
      success: true,
      data: companyData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error en company-lookup-einforma:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      message: getErrorMessage(error.message)
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function getEInformaAccessToken(): Promise<string> {
  console.log('🔑 Obteniendo token de acceso de eInforma...')
  
  const tokenUrl = 'https://api.einforma.com/oauth/token'
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${eInformaClientId}:${eInformaClientSecret}`)}`
    },
    body: 'grant_type=client_credentials&scope=read'
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error obteniendo token eInforma:', errorText)
    throw new Error(`Error de autenticación con eInforma: ${response.status}`)
  }

  const tokenData = await response.json()
  console.log('✅ Token de eInforma obtenido exitosamente')
  
  return tokenData.access_token
}

async function searchCompanyByNif(nif: string, accessToken: string): Promise<CompanyData> {
  console.log('🏢 Buscando empresa en eInforma API...')
  
  const searchUrl = `https://api.einforma.com/v1/companies/search?nif=${encodeURIComponent(nif)}`
  
  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error buscando empresa:', errorText)
    
    if (response.status === 404) {
      throw new Error('COMPANY_NOT_FOUND')
    }
    
    throw new Error(`Error consultando eInforma: ${response.status}`)
  }

  const data = await response.json()
  console.log('📊 Respuesta de eInforma:', data)
  
  if (!data.companies || data.companies.length === 0) {
    throw new Error('COMPANY_NOT_FOUND')
  }

  const company = data.companies[0]
  
  // Transformar datos de eInforma al formato del formulario
  const companyData: CompanyData = {
    name: company.name || company.tradeName || '',
    nif: nif.toUpperCase(),
    address_street: formatAddress(company.address),
    address_city: company.address?.city || '',
    address_postal_code: company.address?.postalCode || '',
    business_sector: company.sector || company.cnae?.description || '',
    legal_representative: formatLegalRepresentative(company.administrators),
    status: company.status === 'ACTIVE' ? 'activo' : 'inactivo',
    client_type: 'empresa'
  }

  return companyData
}

function isValidNifCif(nif: string): boolean {
  if (!nif || typeof nif !== 'string') return false
  
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  
  // Validar formato básico (8-9 caracteres, números + letra)
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  if (nifRegex.test(cleanNif)) {
    return validateNifCheckDigit(cleanNif)
  } else if (cifRegex.test(cleanNif)) {
    return validateCifCheckDigit(cleanNif)
  } else if (nieRegex.test(cleanNif)) {
    return validateNieCheckDigit(cleanNif)
  }
  
  return false
}

function validateNifCheckDigit(nif: string): boolean {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const numbers = nif.slice(0, 8)
  const letter = nif.slice(8)
  
  return letters[parseInt(numbers) % 23] === letter
}

function validateCifCheckDigit(cif: string): boolean {
  const firstLetter = cif[0]
  const numbers = cif.slice(1, 8)
  const control = cif[8]
  
  let sum = 0
  for (let i = 0; i < numbers.length; i++) {
    let digit = parseInt(numbers[i])
    if (i % 2 === 1) { // Posiciones pares (1-indexed)
      digit *= 2
      if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10)
    }
    sum += digit
  }
  
  const controlNumber = (10 - (sum % 10)) % 10
  const controlLetter = 'JABCDEFGHI'[controlNumber]
  
  // Algunos CIF usan número, otros letra
  const organizationTypes = ['N', 'P', 'Q', 'R', 'S', 'W']
  if (organizationTypes.includes(firstLetter)) {
    return control === controlLetter
  } else {
    return control === controlNumber.toString() || control === controlLetter
  }
}

function validateNieCheckDigit(nie: string): boolean {
  const niePrefix = { 'X': '0', 'Y': '1', 'Z': '2' }
  const transformedNie = niePrefix[nie[0] as keyof typeof niePrefix] + nie.slice(1)
  return validateNifCheckDigit(transformedNie)
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
    case 'Formato de NIF/CIF inválido':
      return 'El formato del NIF/CIF introducido no es válido. Verifica que esté bien escrito'
    default:
      return 'Error al consultar los datos empresariales. Inténtalo de nuevo'
  }
}
