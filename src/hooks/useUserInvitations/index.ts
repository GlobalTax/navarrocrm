
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
  const { data: invitations = [], isLoading } = useUserInvitationsQuery()
  const sendInvitation = useSendInvitation()
  const cancelInvitation = useCancelInvitation()
  const deleteInvitation = useDeleteInvitation()
  const resendInvitation = useResendInvitation()
  const bulkCleanup = useBulkCleanupInvitations()

  return {
    invitations,
    isLoading,
    sendInvitation,
    cancelInvitation,
    deleteInvitation,
    resendInvitation,
    bulkCleanup,
    getRoleLabel
  }
}

export type { UserInvitation, SendInvitationParams } from './types'
