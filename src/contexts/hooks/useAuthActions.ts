
import { supabase } from '@/integrations/supabase/client'
import { UserRole } from '../types'
import { createError, handleError } from '@/utils/errorHandler'

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) {
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
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        
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
      // Signout failure no debe ser blocking - falla silenciosamente
    }
  }

  return { signIn, signUp, signOut }
}
