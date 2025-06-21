
import { supabase } from '@/integrations/supabase/client'
import { UserRole } from '../types'
import { cleanCorruptedSessions, clearAuthCaches } from '../utils/authCache'

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AuthActions] Iniciando sesión para:', email)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ [AuthActions] Error en signIn:', error.message)
        
        // Si hay error de credenciales, limpiar sesiones corruptas
        if (error.message.includes('Invalid') || error.message.includes('credentials')) {
          await cleanCorruptedSessions()
        }
        
        throw error
      }
      
      console.log('✅ [AuthActions] Sign in exitoso')
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, role: UserRole, orgId: string) => {
    console.log('📝 [AuthActions] Registrando usuario:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      console.error('❌ [AuthActions] Error en signUp:', error.message)
      throw error
    }

    if (data.user) {
      console.log('👤 [AuthActions] Creando perfil para:', data.user.id)
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          role,
          org_id: orgId
        })
      if (profileError) {
        console.error('❌ [AuthActions] Error creando perfil:', profileError.message)
        throw profileError
      }
    }
  }

  const signOut = async () => {
    console.log('🚪 [AuthActions] Cerrando sesión')
    
    // Limpiar cachés antes del sign out
    clearAuthCaches()
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ [AuthActions] Error en signOut:', error.message)
    }
    
    // Limpiar localStorage como medida adicional
    await cleanCorruptedSessions()
  }

  return { signIn, signUp, signOut }
}
