
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import type { CompanyData } from './types.ts'
import { EInformaService } from './eInformaService.ts'
import { isValidNifCif } from './validation.ts'
import { generateMockCompanyData } from './mockData.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const eInformaClientId = Deno.env.get('EINFORMA_CLIENT_ID')
const eInformaClientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET')

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
      // Crear servicio de eInforma y buscar empresa
      const eInformaService = new EInformaService(eInformaClientId, eInformaClientSecret)
      const companyData = await eInformaService.lookupCompany(cleanNif)
      
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
        warning: `Error de conexión con eInforma: ${eInformaError instanceof Error ? eInformaError.message : String(eInformaError)}`
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
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
