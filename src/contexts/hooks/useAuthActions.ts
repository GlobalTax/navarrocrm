
import { supabase } from '@/integrations/supabase/client'
import { UserRole } from '../types'
import { createError, handleError } from '@/utils/errorHandler'

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
        
        // Crear error específico según el tipo
        let userMessage = 'Error al iniciar sesión'
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Email o contraseña incorrectos'
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Debe confirmar su email antes de iniciar sesión'
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Demasiados intentos. Espere unos minutos'
        }
        
        throw createError(error.message, {
          severity: 'medium',
          retryable: !error.message.includes('credentials'),
          userMessage,
          technicalMessage: error.message
        })
      }
      
      console.log('✅ [AuthActions] Sign in exitoso')
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') {
        throw error
      }
      
      const appError = createError('Error de conexión durante el login', {
        severity: 'high',
        retryable: true,
        userMessage: 'Error de conexión. Verifique su internet e intente de nuevo'
      })
      
      handleError(appError, 'SignIn')
      throw appError
    }
  }

  const signUp = async (email: string, password: string, role: UserRole, orgId: string) => {
    console.log('📝 [AuthActions] Registrando usuario:', email)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) {
        console.error('❌ [AuthActions] Error en signUp:', error.message)
        
        let userMessage = 'Error al registrar usuario'
        if (error.message.includes('User already registered')) {
          userMessage = 'Ya existe una cuenta con este email'
        } else if (error.message.includes('Password')) {
          userMessage = 'La contraseña no cumple los requisitos'
        }
        
        throw createError(error.message, {
          severity: 'medium',
          retryable: false,
          userMessage,
          technicalMessage: error.message
        })
      }

      if (data.user) {
        console.log('👤 [AuthActions] Creando perfil para:', data.user.id)
        
        try {
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
            
            throw createError(profileError.message, {
              severity: 'high',
              retryable: true,
              userMessage: 'Error al crear el perfil de usuario',
              technicalMessage: profileError.message
            })
          }
        } catch (profileError) {
          // Si falla la creación del perfil, intentar limpiar el usuario de auth
          await supabase.auth.signOut()
          throw profileError
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') {
        throw error
      }
      
      const appError = createError('Error de conexión durante el registro', {
        severity: 'high',
        retryable: true,
        userMessage: 'Error de conexión. Verifique su internet e intente de nuevo'
      })
      
      handleError(appError, 'SignUp')
      throw appError
    }
  }

  const signOut = async () => {
    console.log('🚪 [AuthActions] Cerrando sesión')
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ [AuthActions] Error en signOut:', error.message)
        
        // Para signOut, no es crítico si falla - limpiamos local de todas formas
        const appError = createError(error.message, {
          severity: 'low',
          retryable: false,
          userMessage: 'Sesión cerrada (con advertencias)',
          technicalMessage: error.message
        })
        
        handleError(appError, 'SignOut')
      }
    } catch (error) {
      // Signout failure no debe ser blocking
      console.warn('⚠️ [AuthActions] SignOut falló silenciosamente:', error)
    }
  }

  return { signIn, signUp, signOut }
}
