
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'

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

export const useIntelligentWorkflows = () => {
  const { user } = useApp()
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Auto-create tasks when a new case is created
  const createCaseWorkflowTasks = async (caseId: string, practiceArea: string) => {
    const taskTemplates = {
      'fiscal': [
        { description: 'Revisar documentación fiscal', priority: 'high' as const, estimatedHours: 2 },
        { description: 'Preparar declaración', priority: 'medium' as const, estimatedHours: 4 },
        { description: 'Revisión final y presentación', priority: 'high' as const, estimatedHours: 1 }
      ],
      'laboral': [
        { description: 'Análisis de contrato laboral', priority: 'high' as const, estimatedHours: 2 },
        { description: 'Preparar documentación legal', priority: 'medium' as const, estimatedHours: 3 },
        { description: 'Seguimiento y cierre', priority: 'low' as const, estimatedHours: 1 }
      ],
      'mercantil': [
        { description: 'Análisis de documentación societaria', priority: 'high' as const, estimatedHours: 3 },
        { description: 'Preparar acuerdos', priority: 'medium' as const, estimatedHours: 5 },
        { description: 'Tramitación registral', priority: 'high' as const, estimatedHours: 2 }
      ]
    }

    const templates = taskTemplates[practiceArea as keyof typeof taskTemplates] || taskTemplates.fiscal

    for (const template of templates) {
      await supabase.from('tasks').insert({
        title: template.description,
        description: template.description,
        case_id: caseId,
        priority: template.priority,
        estimated_hours: template.estimatedHours,
        status: 'pending',
        org_id: user?.org_id,
        created_by: user?.id
      })
    }
  }

  // Detect inactive cases and suggest actions
  const detectInactiveCases = async () => {
    if (!user?.org_id) return

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: inactiveCases } = await supabase
      .from('cases')
      .select(`
        *,
        tasks:tasks(created_at),
        client:clients(name)
      `)
      .eq('org_id', user.org_id)
      .eq('status', 'open')
      .not('tasks.created_at', 'gte', thirtyDaysAgo)

    return inactiveCases?.map(case_ => ({
      caseId: case_.id,
      title: case_.title,
      clientName: case_.client?.name,
      daysSinceActivity: Math.floor((Date.now() - new Date(case_.date_opened).getTime()) / (1000 * 60 * 60 * 24)),
      suggestions: [
        'Contactar con el cliente para actualización',
        'Revisar el estado del expediente',
        'Programar reunión de seguimiento'
      ]
    }))
  }

  // Smart proposal suggestions based on client type and case
  const generateProposalSuggestions = async (clientId: string, caseType: string) => {
    const suggestions = {
      'fiscal': {
        services: ['Asesoramiento fiscal anual', 'Declaración de la renta', 'Planificación fiscal'],
        estimatedHours: 20,
        suggestedPrice: 1500
      },
      'laboral': {
        services: ['Asesoramiento laboral', 'Gestión de nóminas', 'Resolución de conflictos'],
        estimatedHours: 15,
        suggestedPrice: 1200
      },
      'mercantil': {
        services: ['Constitución de sociedades', 'Modificaciones societarias', 'Due diligence'],
        estimatedHours: 30,
        suggestedPrice: 2500
      }
    }

    return suggestions[caseType as keyof typeof suggestions] || suggestions.fiscal
  }

  // Execute workflow rules
  const executeWorkflow = async (trigger: string, data: any) => {
    const activeWorkflows = workflows.filter(w => w.isActive && w.trigger === trigger)

    for (const workflow of activeWorkflows) {
      try {
        // Check conditions
        const conditionsMet = workflow.conditions.every(condition => {
          const fieldValue = data[condition.field]
          switch (condition.operator) {
            case 'equals':
              return fieldValue === condition.value
            case 'contains':
              return fieldValue?.toString().includes(condition.value)
            case 'greater_than':
              return Number(fieldValue) > Number(condition.value)
            case 'less_than':
              return Number(fieldValue) < Number(condition.value)
            case 'is_null':
              return fieldValue == null
            default:
              return false
          }
        })

        if (conditionsMet) {
          // Execute actions
          for (const action of workflow.actions) {
            await executeWorkflowAction(action, data)
          }

          // Log execution
          await supabase.from('workflow_executions').insert({
            rule_id: workflow.id,
            trigger_data: data,
            status: 'completed',
            executed_at: new Date().toISOString(),
            org_id: user?.org_id
          })
        }
      } catch (error) {
        console.error('Error executing workflow:', error)
        await supabase.from('workflow_executions').insert({
          rule_id: workflow.id,
          trigger_data: data,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          org_id: user?.org_id
        })
      }
    }
  }

  const executeWorkflowAction = async (action: WorkflowAction, data: any) => {
    switch (action.type) {
      case 'create_task':
        await supabase.from('tasks').insert({
          title: action.parameters.title,
          description: action.parameters.description,
          case_id: data.case_id,
          client_id: data.client_id,
          priority: action.parameters.priority || 'medium',
          org_id: user?.org_id,
          created_by: user?.id
        })
        break

      case 'send_email':
        await supabase.functions.invoke('send-email', {
          body: {
            to: action.parameters.to,
            subject: action.parameters.subject,
            content: action.parameters.content
          }
        })
        break

      case 'create_notification':
        toast({
          title: action.parameters.title,
          description: action.parameters.message
        })
        break

      case 'update_status':
        if (data.case_id) {
          await supabase
            .from('cases')
            .update({ status: action.parameters.status })
            .eq('id', data.case_id)
        }
        break
    }
  }

  return {
    workflows,
    executions,
    isLoading,
    createCaseWorkflowTasks,
    detectInactiveCases,
    generateProposalSuggestions,
    executeWorkflow
  }
}
