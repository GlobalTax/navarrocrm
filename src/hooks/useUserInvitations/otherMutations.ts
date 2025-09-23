import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { sendReminderEmail } from './emailUtils'

export const useCancelInvitation = () => {
  const { user } = useApp()
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
      queryClient.invalidateQueries({ queryKey: ['user-invitations', user?.org_id] })
      toast.success('Invitación cancelada')
    },
    onError: () => {
      toast.error('Error cancelando la invitación')
    },
  })
}

export const useResendInvitation = () => {
  const { user } = useApp()
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
        
        // Manejar diferentes tipos de errores como en sendInvitation
        const errorDetails = emailError.details || {}
        const errorCode = errorDetails.errorCode || 'UNKNOWN'
        const userMessage = errorDetails.userMessage || emailError.message
        
        switch (errorCode) {
          case 'DOMAIN_NOT_VERIFIED':
            throw new Error('El dominio de email no está verificado. No se puede reenviar la invitación.')
          case 'TESTING_MODE_ONLY':
            throw new Error('El servicio de email está en modo testing. No se puede reenviar a esta dirección.')
          case 'DEV_MODE_RESTRICTED':
            throw new Error(`Solo se pueden enviar emails a direcciones autorizadas: ${userMessage}`)
          default:
            throw new Error(`Error reenviando el email: ${userMessage}`)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations', user?.org_id] })
      toast.success('Invitación reenviada exitosamente')
    },
    onError: (error: any) => {
      console.error('Error reenviando invitación:', error)
      toast.error(`Error reenviando la invitación: ${error.message}`)
    },
  })
}

export const useBulkCleanupInvitations = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      console.log('🧹 Iniciando limpieza masiva de invitaciones...')
      
      // Llamar a la función de limpieza
      const { data: cleanupResult, error } = await supabase
        .rpc('cleanup_expired_invitations')

      if (error) throw error

      console.log('✅ Limpieza completada, invitaciones procesadas:', cleanupResult)
      return cleanupResult
    },
    onSuccess: (cleanedCount) => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations', user?.org_id] })
      toast.success(`Limpieza completada: ${cleanedCount} invitaciones expiradas procesadas`)
    },
    onError: (error: any) => {
      console.error('Error en limpieza masiva:', error)
      toast.error('Error en la limpieza masiva de invitaciones')
    },
  })
}