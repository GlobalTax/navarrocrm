/**
 * Documents Feature Types
 */

export type DocumentType = 'contract' | 'letter' | 'report' | 'invoice' | 'agreement' | 'other'
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'signed' | 'archived'

export interface Document {
  id: string
  title: string
  content: string
  type: DocumentType
  status: DocumentStatus
  template_id?: string
  case_id?: string
  contact_id?: string
  variables_data?: Record<string, any>
  version_number: number
  file_url?: string
  file_size?: number
  file_type?: string
  is_template: boolean
  org_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface DocumentTemplate {
  id: string
  name: string
  description?: string
  content: string
  type: DocumentType
  variables: DocumentVariable[]
  is_active: boolean
  org_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface DocumentVariable {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  required: boolean
  default_value?: any
  options?: string[]
  description?: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  content: string
  variables_data?: Record<string, any>
  changes_summary?: string
  created_by: string
  created_at: string
  org_id: string
}

export interface DocumentActivity {
  id: string
  document_id: string
  user_id: string
  action_type: 'created' | 'updated' | 'signed' | 'shared' | 'version_created' | 'status_changed'
  details?: Record<string, any>
  created_at: string
  org_id: string
}

export interface DocumentFilter {
  type?: DocumentType
  status?: DocumentStatus
  case_id?: string
  contact_id?: string
  created_by?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface DocumentCreateData {
  title: string
  content?: string
  type: DocumentType
  template_id?: string
  case_id?: string
  contact_id?: string
  variables_data?: Record<string, any>
}

export interface DocumentUpdateData {
  title?: string
  content?: string
  status?: DocumentStatus
  variables_data?: Record<string, any>
}