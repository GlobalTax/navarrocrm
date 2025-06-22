
export interface WorkflowRule {
  id: string
  name: string
  trigger: 'case_created' | 'client_added' | 'task_overdue' | 'proposal_sent' | 'time_logged'
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  isActive: boolean
  priority: number
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_null'
  value: any
}

export interface WorkflowAction {
  type: 'create_task' | 'send_email' | 'update_status' | 'create_notification' | 'assign_user'
  parameters: Record<string, any>
}

export interface WorkflowExecution {
  id: string
  rule_id: string
  trigger_data: any
  status: 'pending' | 'completed' | 'failed'
  executed_at?: string
  error_message?: string
}

export interface TaskTemplate {
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedHours: number
}

export interface InactiveCase {
  caseId: string
  title: string
  clientName?: string
  daysSinceActivity: number
  suggestions: string[]
}

export interface ProposalSuggestion {
  services: string[]
  estimatedHours: number
  suggestedPrice: number
}
