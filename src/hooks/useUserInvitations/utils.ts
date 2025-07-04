import type { UserInvitation } from './types'

/**
 * Utility functions for user invitations
 */

export const isInvitationExpired = (invitation: UserInvitation): boolean => {
  return new Date(invitation.expires_at) < new Date() && invitation.status === 'pending'
}

export const getInvitationStatusColor = (status: string, expired: boolean = false) => {
  if (expired && status === 'pending') status = 'expired'
  
  const colors = {
    pending: 'bg-muted text-muted-foreground border-muted',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expired: 'bg-destructive/10 text-destructive border-destructive/20',
    cancelled: 'bg-muted text-muted-foreground border-muted'
  }
  return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground border-muted'
}

export const getInvitationStatusLabel = (status: string, expired: boolean = false) => {
  if (expired && status === 'pending') status = 'expired'
  
  const labels = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    expired: 'Expirada',
    cancelled: 'Cancelada'
  }
  return labels[status as keyof typeof labels] || status
}

export const filterInvitations = (
  invitations: UserInvitation[], 
  searchTerm: string, 
  statusFilter: string,
  getRoleLabel: (role: string) => string
) => {
  return invitations.filter(invitation => {
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getRoleLabel(invitation.role).toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })
}