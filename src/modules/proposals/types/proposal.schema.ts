
export interface ProposalFormData {
  clientId: string
  selectedArea?: string
  selectedServices?: SelectedService[]
  retainerConfig?: RetainerConfig
  title: string
  introduction?: string
  terms?: string
  validityDays?: number
  is_recurring?: boolean
  recurring_frequency?: string
}

export interface SelectedService {
  id: string
  name: string
  description?: string
  basePrice: number
  customPrice?: number
  quantity?: number
  billingUnit?: string
  estimatedHours?: number
  total?: number
}

export interface RetainerConfig {
  retainerAmount?: number
  includedHours?: number
  extraHourlyRate?: number
  billingFrequency: 'monthly' | 'quarterly' | 'yearly'
  billingDay: number
  autoRenewal: boolean
  contractDuration: number
  paymentTerms: number
}
