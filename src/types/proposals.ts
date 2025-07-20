
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
  customPrice: number
  notes: string
  total: number
  basePrice: number
  billingUnit: string
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

export interface ProposalStep {
  id: number
  name: string
  description: string
}

export const PROPOSAL_STEPS: ProposalStep[] = [
  { id: 1, name: 'Cliente', description: 'Seleccionar cliente o prospecto' },
  { id: 2, name: 'Servicios', description: 'Selección y configuración' },
  { id: 3, name: 'Honorarios', description: 'Configuración económica' },
  { id: 4, name: 'Contenido', description: 'Textos de la propuesta' },
  { id: 5, name: 'Revisión', description: 'Vista previa y envío' }
]

// Interfaces para propuestas generales
export interface Proposal {
  id: string
  org_id: string
  contact_id: string
  proposal_number: string
  title: string
  description: string | null
  introduction?: string
  scope_of_work?: string
  timeline?: string
  notes?: string
  auto_renewal?: boolean
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'under_review' | 'accepted' | 'rejected' | 'expired' | 'won' | 'lost'
  valid_until: string | null
  sent_at: string | null
  accepted_at: string | null
  created_by: string
  created_at: string
  updated_at: string
  proposal_type: 'standard' | 'recurring' | 'service' | 'retainer' | 'project'
  is_recurring: boolean
  recurring_frequency: 'monthly' | 'quarterly' | 'yearly' | null
  contract_start_date: string | null
  contract_end_date: string | null
  next_billing_date: string | null
  billing_day: number | null
  retainer_amount: number | null
  included_hours: number | null
  hourly_rate_extra: number | null
  client?: { name: string; email?: string }
}

export interface ProposalLineItem {
  id: string
  proposal_id: string
  service_name: string
  name: string
  description: string | null
  quantity: number
  unit_price: number
  total_price: number
  billing_unit: string
  estimated_hours: number | null
  service_catalog_id?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface CreateProposalData {
  contact_id: string
  title: string
  description?: string
  proposal_type: 'standard' | 'recurring' | 'service' | 'retainer' | 'project'
  is_recurring: boolean
  valid_until?: string
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  contract_start_date?: string
  contract_end_date?: string
  billing_day?: number
  retainer_amount?: number
  included_hours?: number
  hourly_rate_extra?: number
  notes?: string
  line_items: Omit<ProposalLineItem, 'id' | 'proposal_id' | 'created_at' | 'updated_at'>[]
}
