
export interface SelectedService {
  id: string
  name: string
  description: string
  basePrice: number
  customPrice: number
  quantity: number
  billingUnit: string
  estimatedHours?: number
  total: number
}

export interface LegalProposalData {
  clientId: string
  selectedArea: string
  selectedServices: SelectedService[]
  retainerConfig: {
    retainerAmount: number
    includedHours: number
    extraHourlyRate: number
    billingFrequency: 'monthly' | 'quarterly' | 'yearly'
    billingDay: number
    autoRenewal: boolean
    contractDuration: number
    paymentTerms: number
  }
  title: string
  introduction: string
  terms: string
  validityDays: number
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
