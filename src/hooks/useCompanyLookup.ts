
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
        
        // Mostrar error específico si está disponible
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
        
        const errorMessage = data.message || data.error || 'Error desconocido'
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
        status: data.data.status
      })
      
      toast.success('Empresa encontrada', {
        description: `${data.data.name} - ${data.data.nif}`
      })
      
      return data.data
    } catch (error) {
      console.error('💥 useCompanyLookup - Error de captura:', {
        error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Solo mostrar toast si no se mostró antes
      if (!toast.isActive) {
        const errorMessage = error instanceof Error ? error.message : 'Error inesperado al buscar la empresa'
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
