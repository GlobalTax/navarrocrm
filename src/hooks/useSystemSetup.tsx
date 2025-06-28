
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

const SETUP_CHECK_TIMEOUT = 5000 // Aumentado a 5 segundos para ser más robusto

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      let timeoutId: NodeJS.Timeout

      try {
        console.log('🔧 [useSystemSetup] Iniciando verificación del sistema...')
        
        // Crear timeout de seguridad más robusto
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('TIMEOUT'))
          }, SETUP_CHECK_TIMEOUT)
        })
        
        // Usar la función mejorada is_system_setup
        const queryPromise = supabase.rpc('is_system_setup')
        
        // Ejecutar con timeout
        const result = await Promise.race([queryPromise, timeoutPromise])
        
        clearTimeout(timeoutId)
        
        const { data, error } = result
        
        if (error) {
          console.log('🚨 [useSystemSetup] Error en is_system_setup:', error.message)
          
          // Fallback: verificar organizaciones directamente
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .limit(1)
            .maybeSingle()
          
          if (orgError) {
            console.log('🚨 [useSystemSetup] Error verificando organizaciones:', orgError.message)
            setIsSetup(true) // Fallback seguro: asumir configurado
          } else {
            const hasOrgs = orgData !== null
            console.log('🔧 [useSystemSetup] Verificación fallback - Organizaciones encontradas:', hasOrgs)
            setIsSetup(hasOrgs)
          }
        } else {
          console.log('✅ [useSystemSetup] Verificación exitosa - Sistema configurado:', data)
          setIsSetup(data === true)
        }
      } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId)
        
        if (error.message === 'TIMEOUT') {
          console.warn('⏰ [useSystemSetup] Timeout en verificación - ejecutando verificación adicional...')
          
          // Verificación adicional más rápida en caso de timeout
          try {
            const { data: statusData } = await supabase.rpc('get_setup_status')
            if (statusData && typeof statusData === 'object' && statusData !== null && !Array.isArray(statusData)) {
              console.log('📊 [useSystemSetup] Estado detallado del setup:', statusData)
              // Verificar que statusData tiene la propiedad is_setup_complete y es booleana
              const setupComplete = 'is_setup_complete' in statusData ? 
                Boolean(statusData.is_setup_complete) : false
              setIsSetup(setupComplete)
            } else {
              console.log('🔧 [useSystemSetup] No se pudo obtener estado - asumiendo configurado')
              setIsSetup(true) // Fallback conservador
            }
          } catch (fallbackError) {
            console.error('🚨 [useSystemSetup] Error en verificación de fallback:', fallbackError)
            setIsSetup(true) // Último fallback: asumir configurado
          }
        } else {
          console.error('🚨 [useSystemSetup] Error crítico verificando setup:', error)
          setIsSetup(true) // Fallback robusto: asumir configurado
        }
      } finally {
        console.log('🏁 [useSystemSetup] Finalizando verificación de setup')
        setLoading(false)
      }
    }

    checkSetup()
  }, [])

  const forceRecheck = () => {
    console.log('🔄 [useSystemSetup] Forzando re-verificación del sistema...')
    setLoading(true)
    setIsSetup(null)
    // Trigger el useEffect nuevamente
    window.location.reload()
  }

  return { isSetup, loading, forceRecheck }
}
