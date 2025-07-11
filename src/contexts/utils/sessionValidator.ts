
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export const getInitialSession = async (
  setSession: (session: Session | null) => void,
  setAuthLoading: (loading: boolean) => void
) => {
  let retryCount = 0
  const maxRetries = 2
  
  const attemptGetSession = async (): Promise<Session | null> => {
    // Timeout más robusto - 5 segundos
    const sessionTimeout = setTimeout(() => {
      console.log('⏰ [SessionValidator] Timeout de sesión - intento', retryCount + 1)
      setAuthLoading(false)
    }, 5000)

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      clearTimeout(sessionTimeout)
      
      if (error) {
        console.warn('⚠️ [SessionValidator] Error obteniendo sesión:', error.message)
        
        // Reintentar si hay error y quedan intentos
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`🔄 [SessionValidator] Reintentando... (${retryCount}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return attemptGetSession()
        }
        
        setAuthLoading(false)
        return null
      }

      console.log('📋 [SessionValidator] Sesión inicial:', session ? 'Encontrada' : 'No encontrada')
      setSession(session)
      setAuthLoading(false)
      
      return session
    } catch (error) {
      clearTimeout(sessionTimeout)
      console.error('💥 [SessionValidator] Error crítico:', error)
      
      // Reintentar si queda algún intento
      if (retryCount < maxRetries) {
        retryCount++
        console.log(`🔄 [SessionValidator] Reintentando tras error... (${retryCount}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return attemptGetSession()
      }
      
      setAuthLoading(false)
      return null
    }
  }

  return attemptGetSession()
}
