
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { sendInvitationEmail, sendReminderEmail } from './emailUtils'
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

        // Enviar email
        try {
          await sendInvitationEmail(email, role, tokenResult, user.email, message)
          toast.success('Invitación enviada exitosamente')
        } catch (emailError: any) {
          console.error('❌ Error crítico en envío de email:', emailError)
          throw new Error(`Error enviando el email de invitación: ${emailError.message}`)
        }

        return invitation
      } catch (error: any) {
        console.error('❌ Error en sendInvitation:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
    },
    onError: (error: any) => {
      console.error('Error procesando invitación:', error)
      toast.error(error.message || 'Error procesando la invitación')
    },
  })
}

export const useCancelInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      toast.success('Invitación cancelada')
    },
    onError: (error: any) => {
      toast.error('Error cancelando la invitación')
    },
  })
}

export const useResendInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      console.log('🔄 Reenviando invitación:', invitationId)
      
      // Obtener datos de la invitación
      const { data: invitation, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (error || !invitation) throw new Error('Invitación no encontrada')

      console.log('📧 Datos de invitación:', invitation)

      // Actualizar fecha de expiración
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      await supabase
        .from('user_invitations')
        .update({ 
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId)

      // Reenviar email
      try {
        await sendReminderEmail(invitation.email, invitation.role, invitation.token)
      } catch (emailError: any) {
        console.error('❌ Error crítico reenviando:', emailError)
        throw new Error(`Error reenviando el email: ${emailError.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      toast.success('Invitación reenviada exitosamente')
    },
    onError: (error: any) => {
      console.error('Error reenviando invitación:', error)
      toast.error(`Error reenviando la invitación: ${error.message}`)
    },
  })
}
