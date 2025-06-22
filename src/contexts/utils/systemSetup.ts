
import { supabase } from '@/integrations/supabase/client'

export const initializeSystemSetup = async (
  setIsSetup: (setup: boolean | null) => void,
  setSetupLoading: (loading: boolean) => void
) => {
  try {
    console.log('🔧 [SystemSetup] Verificando setup...')
    
    // Timeout más agresivo
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('⏰ [SystemSetup] Timeout setup - asumiendo configurado')
        resolve(true)
      }, 1000) // Reducido a 1 segundo
    })

    const queryPromise = supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.log('🔧 [SystemSetup] Error setup, asumiendo configurado:', error.message)
          return true
        }
        const setupComplete = data !== null
        console.log('🔧 [SystemSetup] Setup verificado:', setupComplete)
        return setupComplete
      })

    const systemIsSetup = await Promise.race([queryPromise, timeoutPromise])
    setIsSetup(systemIsSetup)
  } catch (error) {
    console.warn('⚠️ [SystemSetup] Error verificando setup:', error)
    setIsSetup(true) // Fallback seguro
  } finally {
    setSetupLoading(false)
  }
}
