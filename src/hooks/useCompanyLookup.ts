
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import type { CompanyData } from './useCompanyLookup/types'
import { validateNifCif, validateCompanyData } from './useCompanyLookup/validation'
import { getErrorMessage, showSuccessToast, handleNetworkError } from './useCompanyLookup/errorHandling'
import { sanitizeCompanyData } from './useCompanyLookup/dataTransform'

export type { CompanyData }

export const useCompanyLookup = () => {
  const [isLoading, setIsLoading] = useState(false)

  const lookupCompany = async (nif: string): Promise<CompanyData | null> => {
    // Paso 1: Validación mejorada de entrada
    const validation = validateNifCif(nif)
    
    if (!validation.isValid) {
      toast.error('NIF/CIF inválido', {
        description: validation.error
      })
      return null
    }

    const cleanNif = validation.cleanNif

    setIsLoading(true)
    console.log('🔍 useCompanyLookup - Iniciando búsqueda empresarial:', cleanNif)

    try {
      const { data, error } = await supabase.functions.invoke('company-lookup-einforma', {
        body: { nif: cleanNif }
      })

      console.log('📥 useCompanyLookup - Respuesta completa:', {
        data,
        error,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : []
      })

      if (error) {
        console.error('❌ useCompanyLookup - Error de función:', error)
        
        const errorMessage = error.message || 'Error al consultar los datos empresariales'
        toast.error('Error de búsqueda', {
          description: errorMessage
        })
        
        throw new Error(errorMessage)
      }

      if (!data) {
        console.error('❌ useCompanyLookup - Sin datos en respuesta')
        toast.error('Sin respuesta', {
          description: 'No se recibió respuesta del servicio de búsqueda'
        })
        return null
      }

      if (!data.success) {
        console.error('❌ useCompanyLookup - Búsqueda sin éxito:', data)
        
        const errorMessage = getErrorMessage(data.error, data.message)
        
        toast.error('Búsqueda fallida', {
          description: errorMessage
        })
        
        throw new Error(errorMessage)
      }

      if (!data.data) {
        console.error('❌ useCompanyLookup - Sin datos de empresa:', data)
        toast.error('Sin datos', {
          description: 'No se encontraron datos de la empresa'
        })
        return null
      }

      // Paso 3: Validación adicional de datos recibidos
      const dataValidation = validateCompanyData(data.data)
      if (!dataValidation.isValid) {
        console.error('❌ useCompanyLookup - Datos de empresa inválidos:', data.data)
        toast.error('Datos incompletos', {
          description: dataValidation.error || 'Los datos de la empresa están incompletos'
        })
        return null
      }

      console.log('✅ useCompanyLookup - Empresa encontrada:', {
        name: data.data.name,
        nif: data.data.nif,
        status: data.data.status,
        isSimulated: data.isSimulated
      })
      
      // Mostrar toast de éxito
      showSuccessToast(data.data, data.isSimulated, data.warning)
      
      // Sanitizar y retornar datos
      return sanitizeCompanyData(data.data, data.isSimulated, data.warning)
      
    } catch (error) {
      console.error('💥 useCompanyLookup - Error de captura:', {
        error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Manejo mejorado de errores de red y sistema
      let errorMessage = 'Error inesperado al buscar la empresa'
      
      if (error instanceof Error) {
        errorMessage = handleNetworkError(error)
      }
      
      // Solo mostrar toast si es un error no mostrado anteriormente
      if (!errorMessage.includes('credenciales') && !errorMessage.includes('encontró')) {
        toast.error('Error de búsqueda', {
          description: errorMessage
        })
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    lookupCompany,
    isLoading
  }
}
