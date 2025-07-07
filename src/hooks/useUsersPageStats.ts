import { useUserInvitations } from './useUserInvitations'

export const useUsersPageStats = () => {
  const { stats: invitationStats, isLoading: invitationsLoading } = useUserInvitations()

  return {
    invitationCount: invitationStats.total,
    pendingInvitations: invitationStats.pending,
    isLoading: invitationsLoading
  }
}