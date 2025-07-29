export interface SubscriptionUserAssignment {
  id: string
  org_id: string
  subscription_id: string
  user_id: string
  assigned_date: string
  status: 'active' | 'inactive'
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionAssignmentData {
  subscription_id: string
  user_id: string
  status?: 'active' | 'inactive'
  notes?: string
}

export interface SubscriptionWithAssignments {
  id: string
  provider_name: string
  quantity: number
  assigned_count: number
  available_count: number
  assignments: SubscriptionUserAssignment[]
}

export interface UserWithAssignments {
  id: string
  email: string
  role: string
  assignments: SubscriptionUserAssignment[]
  total_cost: number
}

export const ASSIGNMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Activa' },
  { value: 'inactive', label: 'Inactiva' }
] as const