
import { supabase } from '@/integrations/supabase/client'
import { UserRole } from '../types'
import { createError, handleError } from '@/utils/errorHandler'
import { authLogger } from '@/utils/logging'

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    try {
      authLogger.info('Iniciando proceso de autenticación', { 
        email, 
        passwordLength: password.length 
      })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      authLogger.info('Respuesta de Supabase recibida', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userEmail: data?.user?.email 
      })
      
      if (error) {
        authLogger.error('Error de Supabase', { errorMessage: error.message })
        
        // Crear error específico según el tipo
        let userMessage = 'Error al iniciar sesión'
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Email o contraseña incorrectos'
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Debe confirmar su email antes de iniciar sesión'
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Demasiados intentos. Espere unos minutos'
        }
        
        authLogger.warn('Lanzando error de autenticación', { userMessage, originalError: error.message })
        throw createError(error.message, {
          severity: 'medium',
          retryable: !error.message.includes('credentials'),
          userMessage,
          technicalMessage: error.message
        })
      }

      if (!data?.user || !data?.session) {
        console.error('❌ [signIn] Respuesta incompleta de Supabase')
        throw createError('Respuesta incompleta del servidor', {
          severity: 'high',
          retryable: true,
          userMessage: 'Error del servidor. Intente de nuevo'
        })
      }

      console.log('✅ [signIn] Usuario logueado exitosamente:', {
        userId: data.user.id,
        email: data.user.email,
        sessionId: data.session.access_token.substring(0, 10) + '...'
      })
      
      console.log('⏱️ [signIn] Esperando para que context se actualice...')
      await new Promise(resolve => setTimeout(resolve, 150))
      console.log('✅ [signIn] Proceso completado')
      
    } catch (error) {
      console.error('💥 [signIn] Error capturado:', error)
      
      if (error instanceof Error && error.name === 'AppError') {
        console.log('🔄 [signIn] Re-lanzando AppError')
        throw error
      }
      
      console.log('🔧 [signIn] Creando nuevo AppError para error desconocido')
      const appError = createError('Error de conexión durante el login', {
        severity: 'high',
        retryable: true,
        userMessage: 'Error de conexión. Verifique su internet e intente de nuevo'
      })
      
      handleError(appError, 'SignIn')
      throw appError
    }
  }

  // Función para activar cuenta desde invitación
  const activateAccount = async (token: string, password: string) => {
    try {
      // Verificar el token de invitación
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      if (invitationError || !invitation) {
        throw createError('Token de invitación inválido o expirado', {
          severity: 'medium',
          retryable: false,
          userMessage: 'El enlace de invitación no es válido o ha expirado'
        })
      }

      // Verificar expiración
      if (new Date(invitation.expires_at) < new Date()) {
        throw createError('Token expirado', {
          severity: 'medium',
          retryable: false,
          userMessage: 'El enlace de invitación ha expirado'
        })
      }

      // Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) {
        let userMessage = 'Error al activar la cuenta'
        if (error.message.includes('User already registered')) {
          userMessage = 'Ya existe una cuenta con este email'
        } else if (error.message.includes('Password')) {
          userMessage = 'La contraseña no cumple los requisitos mínimos'
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
          // Crear perfil de usuario
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: invitation.email,
              role: invitation.role,
              org_id: invitation.org_id
            })
            
          if (profileError) {
            throw createError(profileError.message, {
              severity: 'high',
              retryable: true,
              userMessage: 'Error al crear el perfil de usuario',
              technicalMessage: profileError.message
            })
          }

          // Marcar invitación como aceptada
          await supabase
            .from('user_invitations')
            .update({ 
              status: 'accepted',
              accepted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', invitation.id)

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
      
      const appError = createError('Error de conexión durante la activación', {
        severity: 'high',
        retryable: true,
        userMessage: 'Error de conexión. Verifique su internet e intente de nuevo'
      })
      
      handleError(appError, 'ActivateAccount')
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

  return { signIn, activateAccount, signOut }
}
