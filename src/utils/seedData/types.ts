
export interface SeedUser {
  id: string
  email: string
  role: string
  org_id: string
}

export interface SeedClient {
  name: string
  email: string
  phone: string
  dni_nif: string
  client_type: string
  address_street: string
  address_city: string
  address_postal_code: string
  business_sector?: string
  status: string
  hourly_rate: number
  org_id: string
}

export interface SeedCase {
  title: string
  description: string
  client_id: string
  practice_area: string
  status: string
  matter_number: string
  estimated_budget: number
  billing_method: string
  org_id: string
}

export interface SeedTask {
  title: string
  description: string
  case_id: string
  client_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string
  estimated_hours: number
  created_by: string
  org_id: string
}

export interface SeedResult {
  success: boolean
  orgId?: string
  error?: any
}
