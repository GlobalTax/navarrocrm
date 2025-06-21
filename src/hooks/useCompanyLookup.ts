
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
      toast.error('Por favor, introduce un NIF/CIF válido')
      return null
    }

    setIsLoading(true)
    console.log('🔍 useCompanyLookup - Buscando empresa:', nif)

    try {
      const { data, error } = await supabase.functions.invoke('company-lookup-einforma', {
        body: { nif: nif.trim() }
      })

      console.log('📥 useCompanyLookup - Respuesta:', data)

      if (error) {
        console.error('❌ useCompanyLookup - Error:', error)
        throw new Error(error.message)
      }

      if (!data.success) {
        throw new Error(data.message || data.error)
      }

      console.log('✅ useCompanyLookup - Empresa encontrada:', data.data)
      toast.success('Datos empresariales encontrados y cargados')
      
      return data.data
    } catch (error) {
      console.error('💥 useCompanyLookup - Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al buscar la empresa')
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
