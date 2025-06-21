
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

    // Validar formato NIF/CIF español con logging detallado
    const isValidFormat = isValidNifCif(nif)
    if (!isValidFormat) {
      console.log('❌ Formato NIF/CIF inválido:', nif)
      throw new Error('Formato de NIF/CIF inválido')
    }

    console.log('✅ Formato NIF/CIF válido, procediendo con eInforma')

    // Verificar que tenemos las credenciales de eInforma
    if (!eInformaClientId || !eInformaClientSecret) {
      console.error('❌ Faltan credenciales de eInforma')
      throw new Error('Credenciales de eInforma no configuradas')
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
  if (!nif || typeof nif !== 'string') {
    console.log('❌ NIF vacío o no es string')
    return false
  }
  
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  console.log('🔍 Validando NIF limpio:', cleanNif)
  
  // Validar formato básico (8-9 caracteres, números + letra)
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  if (nifRegex.test(cleanNif)) {
    console.log('🆔 Detectado como NIF, validando...')
    const isValid = validateNifCheckDigit(cleanNif)
    console.log('✅ NIF válido:', isValid)
    return isValid
  } else if (cifRegex.test(cleanNif)) {
    console.log('🏢 Detectado como CIF, validando...')
    const isValid = validateCifCheckDigit(cleanNif)
    console.log('✅ CIF válido:', isValid)
    return isValid
  } else if (nieRegex.test(cleanNif)) {
    console.log('🌍 Detectado como NIE, validando...')
    const isValid = validateNieCheckDigit(cleanNif)
    console.log('✅ NIE válido:', isValid)
    return isValid
  }
  
  console.log('❌ Formato no reconocido')
  return false
}

function validateNifCheckDigit(nif: string): boolean {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const numbers = nif.slice(0, 8)
  const letter = nif.slice(8)
  
  const expectedLetter = letters[parseInt(numbers) % 23]
  console.log(`🔍 NIF: ${numbers} -> Esperada: ${expectedLetter}, Recibida: ${letter}`)
  
  return expectedLetter === letter
}

function validateCifCheckDigit(cif: string): boolean {
  const firstLetter = cif[0]
  const numbers = cif.slice(1, 8)
  const control = cif[8]
  
  console.log(`🔍 CIF: ${firstLetter}${numbers}${control}`)
  
  // Calcular suma según algoritmo oficial CIF
  let sum = 0
  
  // Posiciones impares (1-indexed) = índices pares (0-indexed)
  for (let i = 0; i < numbers.length; i += 2) {
    sum += parseInt(numbers[i])
  }
  
  console.log('📊 Suma posiciones impares:', sum)
  
  // Posiciones pares (1-indexed) = índices impares (0-indexed)
  for (let i = 1; i < numbers.length; i += 2) {
    let doubled = parseInt(numbers[i]) * 2
    if (doubled > 9) {
      doubled = Math.floor(doubled / 10) + (doubled % 10)
    }
    sum += doubled
  }
  
  console.log('📊 Suma total:', sum)
  
  // Calcular dígito de control
  const controlDigit = (10 - (sum % 10)) % 10
  const controlLetter = 'JABCDEFGHI'[controlDigit]
  
  console.log(`🔍 Control calculado: Dígito=${controlDigit}, Letra=${controlLetter}`)
  console.log(`🔍 Control recibido: ${control}`)
  
  // Determinar si debe usar número o letra según el tipo de organización
  const useNumberControl = ['A', 'B', 'E', 'H'].includes(firstLetter)
  const useLetterControl = ['K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'W'].includes(firstLetter)
  
  if (useNumberControl) {
    console.log('🔍 Validando con dígito de control')
    return control === controlDigit.toString()
  } else if (useLetterControl) {
    console.log('🔍 Validando con letra de control')
    return control === controlLetter
  } else {
    // Para otros casos (C, D, F, G, J, V), puede ser cualquiera
    console.log('🔍 Validando con dígito O letra de control')
    return control === controlDigit.toString() || control === controlLetter
  }
}

function validateNieCheckDigit(nie: string): boolean {
  const niePrefix = { 'X': '0', 'Y': '1', 'Z': '2' }
  const transformedNie = niePrefix[nie[0] as keyof typeof niePrefix] + nie.slice(1)
  
  console.log(`🔍 NIE transformado: ${nie} -> ${transformedNie}`)
  
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
    case 'Credenciales de eInforma no configuradas':
      return 'Error de configuración del servicio. Contacta con el administrador'
    default:
      return 'Error al consultar los datos empresariales. Inténtalo de nuevo'
  }
}
