import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { sendInvitationEmail } from './emailUtils'
import type { SendInvitationParams } from './types'

export const useSendInvitation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, role, message }: SendInvitationParams) => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      console.log('🔄 Enviando invitación a:', email, 'con rol:', role)

      try {
        // Verificar si ya existe una invitación pendiente
        const { data: existingInvitation, error: invitationCheckError } = await supabase
          .from('user_invitations')
          .select('id, status')
          .eq('email', email)
          .eq('org_id', user.org_id)
          .eq('status', 'pending')
          .maybeSingle()

        if (invitationCheckError) {
          console.error('❌ Error verificando invitación existente:', invitationCheckError)
        }

        if (existingInvitation) {
          throw new Error(`Ya existe una invitación pendiente para ${email}. Puedes cancelarla primero si deseas enviar una nueva.`)
        }

        // Verificar si el usuario ya existe
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .eq('org_id', user.org_id)
          .maybeSingle()

        if (userCheckError) {
          console.error('❌ Error verificando usuario existente:', userCheckError)
        }

        if (existingUser) {
          throw new Error('Este usuario ya existe en tu organización')
        }

        // Generar token y crear invitación
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const { data: tokenResult } = await supabase
          .rpc('generate_invitation_token')

        if (!tokenResult) throw new Error('Error generando token de invitación')

        const { data: invitation, error } = await supabase
          .from('user_invitations')
          .insert({
            org_id: user.org_id,
            email,
            role,
            token: tokenResult,
            expires_at: expiresAt.toISOString(),
            invited_by: user.id,
            status: 'pending'
          })
          .select()
          .single()

        if (error) throw error

        console.log('✅ Invitación creada exitosamente:', invitation)

        // Modo "sin email" por defecto para aplicación interna
        console.log('✅ Invitación creada en modo interno (sin email automático)')
        toast.success('Invitación creada - copia el enlace manual para enviar', {
          description: 'Aplicación interna: el email no se envía automáticamente'
        })

        // Intentar envio de email solo si se solicita explícitamente
        if (message && message.includes('SEND_EMAIL')) {
          try {
            await sendInvitationEmail(email, role, tokenResult, user.email, message)
            toast.success('Email enviado adiccionalmente')
          } catch (emailError: any) {
            console.error('❌ Error crítico en envío de email:', emailError)
            
            // Manejar diferentes tipos de errores
            const errorDetails = emailError.details || {}
            const errorCode = errorDetails.errorCode || 'UNKNOWN'
            const userMessage = errorDetails.userMessage || emailError.message
            
            switch (errorCode) {
              case 'DOMAIN_NOT_VERIFIED':
                toast.error('Configuración de email pendiente', {
                  duration: 8000,
                  description: 'El dominio de email no está verificado. La invitación se creó pero no se pudo enviar.'
                })
                break
                
              case 'TESTING_MODE_ONLY':
                toast.warning('Modo de desarrollo activo', {
                  duration: 8000,
                  description: 'Solo se pueden enviar emails a direcciones autorizadas. La invitación se creó correctamente.'
                })
                break
                
              case 'DEV_MODE_RESTRICTED':
                throw new Error(userMessage) // Este error debe bloquear la creación
                
              default:
                toast.error('Error enviando email opcional', {
                  duration: 4000,
                  description: `Email falló pero la invitación está lista: ${userMessage}`
                })
            }
            
            // La invitación siempre se crea exitosamente en modo interno
            console.log('✅ Invitación creada (email opcional falló)')
          }
        } else {
          // Sin email - modo interno por defecto
        }

        return invitation
      } catch (error: any) {
        console.error('❌ Error en sendInvitation:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations', user?.org_id] })
    },
    onError: (error: any) => {
      console.error('Error procesando invitación:', error)
      const errorMessage = error.message || 'Error procesando la invitación'
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Por favor, revisa la configuración de email e inténtalo de nuevo.'
      })
    },
  })
}