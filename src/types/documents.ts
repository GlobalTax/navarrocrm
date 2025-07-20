
// Interfaces específicas para documentos y generación

export interface DocumentTemplate {
  id: string
  name: string
  document_type: string
  template_content: string
  variables: TemplateVariable[]
  is_ai_enhanced: boolean
  created_at: string
  updated_at: string
}

export interface TemplateVariable {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone'
  required: boolean
  default?: string | number | boolean | null
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface DocumentFormData {
  title: string
  variables: Record<string, any>
  caseId: string
  contactId: string
  useAI: boolean
}

export interface CaseData {
  id: string
  title: string
  matter_number?: string
  practice_area?: string
  contact_id?: string
  status: string
  created_at: string
  updated_at: string
}

export interface ContactData {
  id: string
  name: string
  email?: string
  phone?: string
  dni_nif?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  client_type?: 'particular' | 'empresa' | 'autonomo'
  status?: string
  created_at: string
  updated_at: string
}

export interface DocumentGenerationResult {
  id: string
  title: string
  content: string
  status: 'success' | 'error'
  url?: string
  message?: string
}
