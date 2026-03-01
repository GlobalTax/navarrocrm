
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
}

export const useCompanyLookup = () => {
  const [isLoading, setIsLoading] = useState(false)

  const lookupCompany = async (nif: string): Promise<CompanyData | null> => {
    if (!nif || !nif.trim()) {
      toast.error('NIF/CIF requerido', {
        description: 'Por favor, introduce un NIF/CIF válido para buscar la empresa'
      })
      return null
    }

    setIsLoading(true)
    console.log('🔍 useCompanyLookup - Iniciando búsqueda empresarial:', nif)

    try {
      const { data, error } = await supabase.functions.invoke('company-lookup-einforma', {
        body: { nif: nif.trim() }
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
        
        let errorMessage = 'Error desconocido'
        
        if (data.error === 'INVALID_CREDENTIALS') {
          errorMessage = 'Las credenciales de eInforma no son válidas. Contacta con el administrador del sistema.'
        } else if (data.error === 'CREDENTIALS_MISSING') {
          errorMessage = 'Las credenciales de eInforma no están configuradas. Contacta con el administrador del sistema.'
        } else if (data.error === 'COMPANY_NOT_FOUND') {
          errorMessage = 'No se encontró ninguna empresa con este NIF/CIF en el Registro Mercantil'
        } else if (data.error === 'INVALID_FORMAT') {
          errorMessage = 'El formato del NIF/CIF no es válido'
        } else {
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

      console.log('✅ useCompanyLookup - Empresa encontrada:', {
        name: data.data.name,
        nif: data.data.nif,
        status: data.data.status,
        isSimulated: data.isSimulated
      })
      
      // Personalizar mensaje según si son datos reales o simulados
      const toastMessage = `${data.data.name} - ${data.data.nif}`
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
      
      return { ...data.data, isSimulated: data.isSimulated, warning: data.warning }
    } catch (error) {
      console.error('💥 useCompanyLookup - Error de captura:', {
        error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Manejo simplificado de errores
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado al buscar la empresa'
      
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
