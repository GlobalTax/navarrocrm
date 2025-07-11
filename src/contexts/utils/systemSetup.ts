
import { supabase } from '@/integrations/supabase/client'

// Cache simple para evitar consultas repetidas
let setupCache: { result: boolean; timestamp: number } | null = null
const CACHE_DURATION = 30000 // 30 segundos

export const initializeSystemSetup = async (
  setIsSetup: (setup: boolean | null) => void,
  setSetupLoading: (loading: boolean) => void
) => {
  try {
    console.log('🔧 [SystemSetup] Verificando setup...')
    
    // Verificar cache primero
    if (setupCache && Date.now() - setupCache.timestamp < CACHE_DURATION) {
      console.log('📋 [SystemSetup] Usando resultado cacheado:', setupCache.result)
      setIsSetup(setupCache.result)
      setSetupLoading(false)
      return
    }
    
    // Timeout más conservador pero aún ágil
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('⏰ [SystemSetup] Timeout setup - asumiendo configurado')
        resolve(true)
      }, 3000) // 3 segundos es más razonable
    })

    // Consulta optimizada - solo contar organizaciones
    const queryPromise = supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (error) {
          console.log('🔧 [SystemSetup] Error setup, asumiendo configurado:', error.message)
          return true
        }
        const setupComplete = (count ?? 0) > 0
        console.log('🔧 [SystemSetup] Setup verificado:', setupComplete, `(${count} orgs)`)
        
        // Cachear resultado
        setupCache = { result: setupComplete, timestamp: Date.now() }
        
        return setupComplete
      })

    const systemIsSetup = await Promise.race([queryPromise, timeoutPromise])
    setIsSetup(systemIsSetup)
  } catch (error) {
    console.warn('⚠️ [SystemSetup] Error crítico verificando setup:', error)
    // Fallback agresivo - asumir configurado para no bloquear
    setIsSetup(true)
  } finally {
    setSetupLoading(false)
  }
}
