
export interface UserInvitation {
  id: string
  org_id: string
  email: string
  role: string
  token: string
  expires_at: string
  invited_by: string
  accepted_at?: string
  created_at: string
  updated_at: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
}

export interface SendInvitationParams {
  email: string
  role: string
  message?: string
}
