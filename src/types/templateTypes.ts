
export interface TemplateStage {
  id: string
  name: string
  description?: string
  order: number
  estimated_days: number
  required_documents: string[]
  default_assignee_role?: string
  is_critical: boolean
}

export interface TemplateTask {
  id: string
  name: string
  description?: string
  stage_id?: string
  estimated_hours: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee_role?: string
  due_days_after_start: number
  dependencies: string[]
  is_automatic: boolean
}

export interface TemplateBilling {
  method: 'hourly' | 'fixed' | 'contingency' | 'retainer'
  hourly_rates: Record<string, number> // por rol o etapa
  fixed_amount?: number
  retainer_amount?: number
  estimated_hours_total: number
  estimated_hours_by_stage: Record<string, number>
  typical_expenses: Array<{
    id: string
    name: string
    estimated_amount: number
    category: string
  }>
}

export interface TemplateDocument {
  id: string
  name: string
  type: 'contract' | 'form' | 'letter' | 'report' | 'other'
  stage_id?: string
  is_required: boolean
  template_path?: string
}

export interface TemplateEmailTemplate {
  id: string
  name: string
  stage_id?: string
  trigger: 'stage_start' | 'stage_complete' | 'task_due' | 'manual'
  subject: string
  body: string
  recipients: string[]
}

export interface AdvancedTemplateData {
  icon?: string
  color?: string
  category: string
  tags: string[]
  complexity: 'basic' | 'intermediate' | 'advanced'
  estimated_duration_days: number
  stages: TemplateStage[]
  tasks: TemplateTask[]
  billing: TemplateBilling
  documents: TemplateDocument[]
  email_templates: TemplateEmailTemplate[]
  auto_communications: boolean
  client_portal_access: boolean
}

export interface CreateAdvancedTemplateData {
  name: string
  description?: string
  practice_area_id?: string
  default_billing_method: string
  template_data: AdvancedTemplateData
}
