import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface CompanyData {
  name: string
  nif: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  business_sector?: string
  legal_representative?: string
  status: 'activo' | 'inactivo'
  client_type: 'empresa'
  // Propiedades adicionales para información de prueba
  isSimulated?: boolean
  warning?: string
}

// Función de validación centralizada y mejorada
const validateNifCif = (nif: string): { isValid: boolean; cleanNif: string; error?: string } => {
  const cleanNif = nif?.trim().toUpperCase() || ''
  
  // Validación de longitud mínima
  if (!cleanNif || cleanNif.length < 8) {
    return {
      isValid: false,
      cleanNif,
      error: 'El NIF/CIF debe tener al menos 8 caracteres'
    }
  }

  // Validación de longitud máxima
  if (cleanNif.length > 9) {
    return {
      isValid: false,
      cleanNif,
      error: 'El NIF/CIF no puede tener más de 9 caracteres'
    }
  }

  // Patrones de validación específicos y estrictos
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  const isValidFormat = nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  
  if (!isValidFormat) {
    return {
      isValid: false,
      cleanNif,
      error: 'Formato NIF/CIF inválido. Debe ser formato español válido (ej: B12345678, 12345678Z, X1234567L)'
    }
  }

  return { isValid: true, cleanNif }
}

// Función para validar datos recibidos de la API
const validateCompanyData = (data: any): { isValid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de empresa no válidos' }
  }

  // Campos obligatorios
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { isValid: false, error: 'El nombre de la empresa es obligatorio' }
  }

  if (!data.nif || typeof data.nif !== 'string' || data.nif.trim().length === 0) {
    return { isValid: false, error: 'El NIF/CIF de la empresa es obligatorio' }
  }

  // Validar que el status sea válido
  if (data.status && !['activo', 'inactivo'].includes(data.status)) {
    return { isValid: false, error: 'Estado de empresa no válido' }
  }

  return { isValid: true }
}

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
        
        // Paso 4: Manejo mejorado de errores específicos
        let errorMessage = 'Error desconocido'
        
        switch (data.error) {
          case 'INVALID_CREDENTIALS':
            errorMessage = 'Las credenciales de eInforma no son válidas. Contacta con el administrador del sistema.'
            break
          case 'CREDENTIALS_MISSING':
            errorMessage = 'Las credenciales de eInforma no están configuradas. Contacta con el administrador del sistema.'
            break
          case 'COMPANY_NOT_FOUND':
            errorMessage = 'No se encontró ninguna empresa con este NIF/CIF en el Registro Mercantil'
            break
          case 'INVALID_FORMAT':
            errorMessage = 'El formato del NIF/CIF no es válido'
            break
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage = 'Se ha excedido el límite de consultas. Inténtalo de nuevo en unos minutos.'
            break
          case 'SERVICE_UNAVAILABLE':
            errorMessage = 'El servicio de consulta no está disponible temporalmente. Inténtalo más tarde.'
            break
          case 'TIMEOUT':
            errorMessage = 'La consulta ha tardado demasiado. Inténtalo de nuevo.'
            break
          default:
            errorMessage = data.message || 'Error al consultar los datos empresariales'
        }
        
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
      
      // Paso 5: Mensajes de éxito mejorados y más informativos
      let toastMessage = `${data.data.name} - ${data.data.nif}`
      let toastDescription = ''
      
      if (data.isSimulated) {
        if (data.warning) {
          toastDescription = data.warning
          toast.warning('Empresa encontrada (datos de prueba)', {
            description: `${toastMessage} - ${toastDescription}`
          })
        } else {
          toastDescription = 'Datos de prueba para desarrollo'
          toast.info('Empresa encontrada (datos de prueba)', {
            description: `${toastMessage} - ${toastDescription}`
          })
        }
      } else {
        toastDescription = 'Datos oficiales del Registro Mercantil'
        toast.success('Empresa encontrada', {
          description: `${toastMessage} - ${toastDescription}`
        })
      }
      
      // Sanitizar datos antes de retornar
      const sanitizedData: CompanyData = {
        name: data.data.name.trim(),
        nif: data.data.nif.trim().toUpperCase(),
        address_street: data.data.address_street?.trim() || undefined,
        address_city: data.data.address_city?.trim() || undefined,
        address_postal_code: data.data.address_postal_code?.trim() || undefined,
        business_sector: data.data.business_sector?.trim() || undefined,
        legal_representative: data.data.legal_representative?.trim() || undefined,
        status: data.data.status === 'activo' ? 'activo' : 'inactivo',
        client_type: 'empresa',
        isSimulated: data.isSimulated,
        warning: data.warning
      }
      
      return sanitizedData
    } catch (error) {
      console.error('💥 useCompanyLookup - Error de captura:', {
        error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Manejo mejorado de errores de red y sistema
      let errorMessage = 'Error inesperado al buscar la empresa'
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'La consulta ha tardado demasiado. Inténtalo de nuevo.'
        } else if (!error.message.includes('credenciales') && !error.message.includes('encontró')) {
          errorMessage = error.message
        }
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
