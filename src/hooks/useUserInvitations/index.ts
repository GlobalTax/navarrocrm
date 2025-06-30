
import { getRoleLabel } from './emailUtils'
import { useSendInvitation, useCancelInvitation, useResendInvitation } from './mutations'
import { useUserInvitationsQuery } from './queries'

export const useUserInvitations = () => {
  const { data: invitations = [], isLoading } = useUserInvitationsQuery()
  const sendInvitation = useSendInvitation()
  const cancelInvitation = useCancelInvitation()
  const resendInvitation = useResendInvitation()

  return {
    invitations,
    isLoading,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    getRoleLabel
  }
}

export type { UserInvitation, SendInvitationParams } from './types'
