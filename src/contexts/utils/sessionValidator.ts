
import { Session } from '@supabase/supabase-js'

export const isValidSession = (session: Session): boolean => {
  try {
    // Verificar que la sesión tenga los campos básicos
    if (!session.access_token || !session.user?.id) {
      return false
    }
    
    // Verificar que no esté expirada (con margen de 5 minutos)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = session.expires_at || 0
    if (expiresAt > 0 && (expiresAt - now) < 300) { // 5 minutos de margen
      console.log('⏰ [SessionValidator] Sesión expira pronto o ya expiró')
      return false
    }
    
    return true
  } catch (error) {
    console.error('❌ [SessionValidator] Error validando sesión:', error)
    return false
  }
}

export const cleanCorruptedSessions = async () => {
  try {
    console.log('🧹 [SessionValidator] Limpiando sesiones corruptas...')
    
    // Limpiar localStorage de Supabase
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') || key.includes('supabase')
    )
    
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log('🗑️ [SessionValidator] Eliminado:', key)
    })
    
    console.log('✅ [SessionValidator] Limpieza completada')
  } catch (error) {
    console.error('❌ [SessionValidator] Error limpiando sesiones:', error)
  }
}
