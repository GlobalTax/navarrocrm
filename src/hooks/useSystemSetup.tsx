
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

const SETUP_CHECK_TIMEOUT = 4000 // 4 segundos timeout

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      let timeoutId: NodeJS.Timeout

      try {
        console.log('🔧 [useSystemSetup] Verificando configuración del sistema...')
        
        // Timeout de seguridad
        const controller = new AbortController()
        timeoutId = setTimeout(() => {
          console.warn('⏰ [useSystemSetup] Timeout en verificación - asumiendo setup necesario')
          controller.abort()
        }, SETUP_CHECK_TIMEOUT)
        
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal)
        
        clearTimeout(timeoutId)
        
        if (error) {
          console.log('🔧 [useSystemSetup] Error consultando organizations:', error.message)
          console.log('🔧 [useSystemSetup] Sistema necesita configuración')
          setIsSetup(false)
        } else {
          const hasOrganizations = data && data.length > 0
          console.log('🔧 [useSystemSetup] Organizaciones encontradas:', hasOrganizations ? data.length : 0)
          setIsSetup(hasOrganizations)
        }
      } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId)
        
        if (error.name === 'AbortError') {
          console.warn('🔧 [useSystemSetup] Verificación cancelada por timeout')
          setIsSetup(false) // Por seguridad, asumir que necesita setup
        } else {
          console.error('🔧 [useSystemSetup] Error crítico verificando setup:', error)
          console.log('🔧 [useSystemSetup] Asumiendo que necesita configuración')
          setIsSetup(false)
        }
      } finally {
        console.log('🔧 [useSystemSetup] Finalizando verificación de setup')
        setLoading(false)
      }
    }

    checkSetup()
  }, [])

  return { isSetup, loading }
}
