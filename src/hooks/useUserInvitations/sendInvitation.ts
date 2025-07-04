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
      queryClient.invalidateQueries({ queryKey: ['user-invitations', user?.org_id] })
    },
    onError: (error: any) => {
      console.error('Error procesando invitación:', error)
      toast.error(error.message || 'Error procesando la invitación')
    },
  })
}