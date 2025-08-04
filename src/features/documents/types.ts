/**
 * Types para el módulo de Documents
 */

export interface Document {
  id: string
  title: string
  content: string
  type: 'contract' | 'letter' | 'report' | 'template' | 'other'
  status: 'draft' | 'review' | 'approved' | 'signed' | 'archived'
  case_id?: string
  contact_id?: string
  template_id?: string
  version_number: number
  is_template: boolean
  template_variables?: Record<string, any>
  variables_data?: Record<string, any>
  created_by: string
  updated_by?: string
  org_id: string
  created_at: string
  updated_at: string
  // Relaciones
  case?: {
    id: string
    title: string
  }
  contact?: {
    id: string
    name: string
  }
  template?: {
    id: string
    title: string
  }
  versions?: DocumentVersion[]
  activities?: DocumentActivity[]
}

export interface DocumentTemplate {
  id: string
  title: string
  content: string
  description?: string
  category: string
  template_variables: Record<string, any>
  is_active: boolean
  usage_count: number
  created_by: string
  org_id: string
  created_at: string
  updated_at: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  content: string
  variables_data?: Record<string, any>
  created_by: string
  changes_summary?: string
  org_id: string
  created_at: string
}

export interface DocumentActivity {
  id: string
  document_id: string
  user_id: string
  action_type: 'created' | 'updated' | 'shared' | 'signed' | 'downloaded' | 'deleted'
  details?: Record<string, any>
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  org_id: string
  created_at: string
}

export interface DocumentComment {
  id: string
  document_id: string
  user_id: string
  comment_text: string
  position_data?: Record<string, any>
  parent_comment_id?: string
  mentioned_users?: string[]
  version_id?: string
  is_internal: boolean
  status: 'active' | 'resolved' | 'deleted'
  org_id: string
  created_at: string
  updated_at: string
}

export interface DocumentAnalysisResult {
  id: string
  document_id: string
  analysis_type: 'compliance' | 'quality' | 'risk' | 'completeness'
  findings: Array<{
    type: 'error' | 'warning' | 'suggestion'
    message: string
    location?: string
    severity: 'low' | 'medium' | 'high'
  }>
  suggestions: Array<{
    type: 'improvement' | 'correction' | 'optimization'
    message: string
    example?: string
  }>
  confidence_score: number
  analysis_data?: Record<string, any>
  org_id: string
  created_at: string
}

export interface DocumentFilters {
  search: string
  type: Document['type'] | 'all'
  status: Document['status'] | 'all'
  case_id: string | 'all'
  contact_id: string | 'all'
  created_by: string | 'all'
  date_range: {
    start: string
    end: string
  } | null
}

export interface DocumentStats {
  total_documents: number
  by_type: Record<Document['type'], number>
  by_status: Record<Document['status'], number>
  total_templates: number
  active_templates: number
  documents_this_month: number
  templates_usage: number
}

// Constantes útiles
export const DOCUMENT_TYPES = {
  contract: 'Contrato',
  letter: 'Carta',
  report: 'Informe',
  template: 'Plantilla',
  other: 'Otro'
} as const

export const DOCUMENT_STATUSES = {
  draft: 'Borrador',
  review: 'En revisión',
  approved: 'Aprobado',
  signed: 'Firmado',
  archived: 'Archivado'
} as const

export const ANALYSIS_TYPES = {
  compliance: 'Cumplimiento normativo',
  quality: 'Calidad del documento',
  risk: 'Análisis de riesgo',
  completeness: 'Completitud'
} as const