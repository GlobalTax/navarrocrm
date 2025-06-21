
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        console.log('🔧 [useSystemSetup] Verificando configuración del sistema...')
        
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
        
        if (error) {
          console.log('🔧 [useSystemSetup] Error consultando organizations:', error.message)
          console.log('🔧 [useSystemSetup] Sistema necesita configuración')
          setIsSetup(false)
        } else {
          const hasOrganizations = data && data.length > 0
          console.log('🔧 [useSystemSetup] Organizaciones encontradas:', hasOrganizations ? data.length : 0)
          setIsSetup(hasOrganizations)
        }
      } catch (error) {
        console.error('🔧 [useSystemSetup] Error crítico verificando setup:', error)
        console.log('🔧 [useSystemSetup] Asumiendo que necesita configuración')
        setIsSetup(false)
      } finally {
        console.log('🔧 [useSystemSetup] Finalizando verificación de setup')
        setLoading(false)
      }
    }

    checkSetup()
  }, [])

  return { isSetup, loading }
}
