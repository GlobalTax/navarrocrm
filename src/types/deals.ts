
export interface Deal {
  id: string
  name: string
  company_name: string
  deal_type: 'acquisition' | 'sale' | 'merger' | 'joint_venture'
  stage: DealStage
  value: number
  currency: string
  probability: number
  expected_close_date: string
  assigned_to: string
  created_at: string
  updated_at: string
  org_id: string
  
  // Campos específicos M&A
  target_company?: string
  acquirer_company?: string
  industry: string
  geography: string
  deal_structure: 'asset' | 'stock' | 'merger'
  financing_type: 'cash' | 'stock' | 'mixed'
  
  // Due Diligence
  dd_status: 'not_started' | 'in_progress' | 'completed' | 'issues_found'
  dd_deadline?: string
  
  // Documentos y equipo
  lead_advisor?: string
  deal_team: string[]
  key_documents: DealDocument[]
}

export interface DealDocument {
  id: string
  name: string
  type: 'nda' | 'loi' | 'due_diligence' | 'valuation' | 'contract' | 'closing_docs'
  status: 'pending' | 'draft' | 'review' | 'approved' | 'signed'
  uploaded_by: string
  uploaded_at: string
  access_level: 'internal' | 'client' | 'counterparty' | 'public'
}

export type DealStage = 
  | 'sourcing'
  | 'initial_contact'
  | 'nda_signed' 
  | 'preliminary_review'
  | 'loi_negotiation'
  | 'due_diligence'
  | 'final_negotiation'
  | 'closing'
  | 'completed'
  | 'lost'

export const DEAL_STAGES: { value: DealStage; label: string; color: string }[] = [
  { value: 'sourcing', label: 'Sourcing', color: 'bg-gray-500' },
  { value: 'initial_contact', label: 'Initial Contact', color: 'bg-blue-500' },
  { value: 'nda_signed', label: 'NDA Signed', color: 'bg-indigo-500' },
  { value: 'preliminary_review', label: 'Preliminary Review', color: 'bg-purple-500' },
  { value: 'loi_negotiation', label: 'LOI Negotiation', color: 'bg-yellow-500' },
  { value: 'due_diligence', label: 'Due Diligence', color: 'bg-orange-500' },
  { value: 'final_negotiation', label: 'Final Negotiation', color: 'bg-red-500' },
  { value: 'closing', label: 'Closing', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-600' },
  { value: 'lost', label: 'Lost', color: 'bg-gray-400' }
]
