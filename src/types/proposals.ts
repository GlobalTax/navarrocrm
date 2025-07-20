
// Interfaces específicas para propuestas legales

export interface PracticeArea {
  id: string
  name: string
  description: string
  services: LegalService[]
}

export interface LegalService {
  id: string
  name: string
  description: string
  price: number
  estimatedHours: number
  category: string
  requirements?: string[]
  deliverables?: string[]
}

export interface SelectedService extends LegalService {
  quantity: number
  customPrice?: number
  notes?: string
  total: number
}

export interface RetainerConfig {
  retainerAmount: number
  includedHours: number
  extraHourlyRate: number
  billingFrequency: 'monthly' | 'quarterly' | 'yearly'
  billingDay: number
  autoRenewal: boolean
  contractDuration: number
  paymentTerms: number
}

export interface LegalProposalData {
  clientId: string
  selectedArea: string
  selectedServices: SelectedService[]
  retainerConfig: RetainerConfig
  title: string
  introduction: string
  terms: string
  validityDays: number
}

export interface ProposalFormState {
  currentStep: number
  canProceed: boolean
  isSubmitting: boolean
  errors: Record<string, string>
  showSuccess: boolean
}
