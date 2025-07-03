
import { getRoleLabel } from './emailUtils'
import { 
  useSendInvitation, 
  useCancelInvitation, 
  useDeleteInvitation,
  useResendInvitation,
  useBulkCleanupInvitations 
} from './mutations'
import { useUserInvitationsQuery } from './queries'

export const useUserInvitations = () => {
  const { data: invitations = [], isLoading, error } = useUserInvitationsQuery()
  const sendInvitation = useSendInvitation()
  const cancelInvitation = useCancelInvitation()
  const deleteInvitation = useDeleteInvitation()
  const resendInvitation = useResendInvitation()
  const bulkCleanup = useBulkCleanupInvitations()

  // Estadísticas útiles
  const stats = {
    total: invitations.length,
    pending: invitations.filter(inv => inv.status === 'pending').length,
    accepted: invitations.filter(inv => inv.status === 'accepted').length,
    expired: invitations.filter(inv => inv.status === 'expired').length,
    cancelled: invitations.filter(inv => inv.status === 'cancelled').length
  }

  // Funciones de utilidad
  const getInvitationById = (id: string) => 
    invitations.find(inv => inv.id === id)

  const getInvitationsByStatus = (status: string) => 
    invitations.filter(inv => inv.status === status)

  const getExpiredInvitations = () => 
    invitations.filter(inv => {
      const expired = new Date(inv.expires_at) < new Date()
      return expired && inv.status === 'pending'
    })

  return {
    // Datos
    invitations,
    isLoading,
    error,
    
    // Estadísticas
    stats,
    
    // Mutaciones
    sendInvitation,
    cancelInvitation,
    deleteInvitation,
    resendInvitation,
    bulkCleanup,
    
    // Utilidades
    getRoleLabel,
    getInvitationById,
    getInvitationsByStatus,
    getExpiredInvitations
  }
}

export type { UserInvitation, SendInvitationParams } from './types'
