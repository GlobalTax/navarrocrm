import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export const useDeleteInvitation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      console.log('🗑️ Eliminando invitación:', invitationId)
      
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId)

      if (error) throw error
      
      return invitationId
    },
    onMutate: async (invitationId: string) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ['user-invitations', user?.org_id] })
      
      // Snapshot del estado anterior para rollback
      const previousInvitations = queryClient.getQueryData(['user-invitations', user?.org_id])
      
      // Actualización optimista: eliminar inmediatamente del cache
      queryClient.setQueryData(['user-invitations', user?.org_id], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.filter((inv: any) => inv.id !== invitationId)
      })
      
      return { previousInvitations }
    },
    onSuccess: () => {
      console.log('✅ Invitación eliminada exitosamente')
      toast.success('Invitación eliminada permanentemente')
    },
    onError: (error: any, invitationId, context) => {
      // Rollback en caso de error
      if (context?.previousInvitations) {
        queryClient.setQueryData(['user-invitations', user?.org_id], context.previousInvitations)
      }
      
      console.error('Error eliminando invitación:', error)
      toast.error('Error eliminando la invitación')
    },
    onSettled: () => {
      // Refetch como fallback para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: ['user-invitations', user?.org_id] })
    },
  })
}