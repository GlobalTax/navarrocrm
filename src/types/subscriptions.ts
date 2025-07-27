export interface SubscriptionPlan {
  id: string
  org_id: string
  name: string
  description?: string
  price: number
  billing_frequency: 'monthly' | 'quarterly' | 'yearly'
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  org_id: string
  contact_id: string
  plan_id?: string
  plan_name: string
  price: number
  start_date: string
  end_date?: string
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAUSED'
  payment_method?: string
  last_payment_date?: string
  next_payment_due: string
  notes?: string
  billing_frequency: 'monthly' | 'quarterly' | 'yearly'
  auto_renew: boolean
  created_by: string
  created_at: string
  updated_at: string
  // Relaciones
  contact?: {
    id: string
    name: string
    email?: string | null
  } | null
  plan?: SubscriptionPlan | null
}

export interface SubscriptionPayment {
  id: string
  org_id: string
  subscription_id: string
  amount: number
  payment_date: string
  payment_method?: string
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'REFUNDED'
  transaction_id?: string
  notes?: string
  created_at: string
}

export interface CreateSubscriptionData {
  contact_id: string
  plan_id?: string
  plan_name: string
  price: number
  start_date: string
  end_date?: string
  payment_method?: string
  billing_frequency: 'monthly' | 'quarterly' | 'yearly'
  auto_renew: boolean
  notes?: string
}

export interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyRevenue: number
  churnRate: number
  averageSubscriptionValue: number
}