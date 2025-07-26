/**
 * Tipos para el módulo de documentos
 */

import { BaseEntity } from '../core'

export type DocumentType = 'template' | 'generated' | 'uploaded'
export type DocumentStatus = 'draft' | 'active' | 'archived'

export interface DocumentVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  label: string
  required: boolean
  default_value?: string | number | boolean
  options?: string[] // para tipo 'select'
  placeholder?: string
  description?: string
}

export interface DocumentTemplate extends BaseEntity {
  name: string
  description: string | null
  content: string
  variables: DocumentVariable[]
  category: string | null
  is_active: boolean
  is_ai_enhanced: boolean
  usage_count: number
}

export interface GeneratedDocument extends BaseEntity {
  name: string
  template_id: string | null
  case_id: string | null
  contact_id: string | null
  content: string
  file_path: string | null
  file_size: number | null
  mime_type: string | null
  status: DocumentStatus
  generated_by_user_id: string
  variables_data: Record<string, unknown>
}

export interface DocumentFormData {
  templateId: string
  variables: Record<string, unknown>
  caseId?: string
  contactId?: string
  fileName: string
}

export interface DocumentGenerationContext {
  template: DocumentTemplate
  cases: Array<{ id: string; title: string; case_number: string }>
  contacts: Array<{ id: string; name: string; email: string }>
  variables: Record<string, unknown>
  selectedCase?: string
  selectedContact?: string
}

export interface DocumentPreview {
  content: string
  variables_resolved: Record<string, unknown>
  estimated_pages: number
}

export interface BulkDocumentGeneration {
  template_id: string
  targets: Array<{
    case_id?: string
    contact_id?: string
    variables: Record<string, unknown>
    file_name: string
  }>
}