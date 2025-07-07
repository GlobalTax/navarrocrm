export const calculateInvitationStats = (invitations: any[]) => {
  const total = invitations.length
  const pending = invitations.filter(inv => inv.status === 'pending').length
  const accepted = invitations.filter(inv => inv.status === 'accepted').length
  const expired = invitations.filter(inv => inv.status === 'expired').length
  const failed = invitations.filter(inv => inv.status === 'failed').length

  return {
    total,
    pending,
    accepted, 
    expired,
    failed
  }
}