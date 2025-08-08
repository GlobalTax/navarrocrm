export interface OutgoingSubscription {
  id: string
  org_id: string
  provider_name: string
  description?: string
  category: 'SOFTWARE' | 'MARKETING' | 'SERVICIOS_LEGALES' | 'INFRAESTRUCTURA' | 'DISENO' | 'COMUNICACION' | 'OTROS'
  amount: number
  currency: string
  billing_cycle: 'MONTHLY' | 'YEARLY' | 'OTHER'
  start_date: string
  next_renewal_date: string
  status: 'ACTIVE' | 'CANCELLED'
  payment_method?: string
  responsible_user_id: string
  department_id?: string | null
  notes?: string
  quantity: number
  unit_description?: string
  created_at: string
  updated_at: string
}

export interface CreateOutgoingSubscriptionData {
  provider_name: string
  description?: string
  category: OutgoingSubscription['category']
  amount: number
  currency?: string
  billing_cycle: OutgoingSubscription['billing_cycle']
  start_date: string
  next_renewal_date: string
  payment_method?: string
  responsible_user_id: string
  department_id?: string | null
  notes?: string
  quantity?: number
  unit_description?: string
}

export interface OutgoingSubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyTotal: number
  yearlyTotal: number
  averageMonthlyAmount: number
  upcomingRenewals: number
  perDepartmentMonthlyTotal?: Record<string, number>
  perDepartmentCount?: Record<string, number>
}

export const SUBSCRIPTION_CATEGORIES = [
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SERVICIOS_LEGALES', label: 'Servicios Legales' },
  { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
  { value: 'DISENO', label: 'Diseño' },
  { value: 'COMUNICACION', label: 'Comunicación' },
  { value: 'OTROS', label: 'Otros' }
] as const

export const BILLING_CYCLES = [
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'YEARLY', label: 'Anual' },
  { value: 'OTHER', label: 'Otro' }
] as const