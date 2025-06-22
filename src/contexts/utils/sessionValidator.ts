
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export const getInitialSession = async (
  setSession: (session: Session | null) => void,
  setAuthLoading: (loading: boolean) => void
) => {
  // Timeout más agresivo para evitar bloqueos
  const sessionTimeout = setTimeout(() => {
    console.log('⏰ [SessionValidator] Timeout de sesión inicial')
    setAuthLoading(false)
  }, 1500) // Reducido a 1.5 segundos

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    clearTimeout(sessionTimeout)
    
    if (error) {
      console.warn('⚠️ [SessionValidator] Error obteniendo sesión:', error.message)
      setAuthLoading(false)
      return null
    }

    console.log('📋 [SessionValidator] Sesión inicial:', session ? 'Encontrada' : 'No encontrada')
    setSession(session)
    setAuthLoading(false)
    
    return session
  } catch (error) {
    clearTimeout(sessionTimeout)
    setAuthLoading(false)
    return null
  }
}
