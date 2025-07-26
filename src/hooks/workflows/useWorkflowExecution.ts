
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { tasksDAL, type CreateTaskData, casesDAL } from '@/lib/dal'
import { WorkflowRule, WorkflowAction } from './types'

export const useWorkflowExecution = () => {
  const { user } = useApp()

  const executeWorkflow = async (trigger: string, data: any, workflows: WorkflowRule[]) => {
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

          // Log execution - usar cualquier tabla existente para evitar errores de tipo
          try {
            console.log('Workflow executed successfully:', {
              rule_id: workflow.id,
              trigger_data: data,
              status: 'completed',
              executed_at: new Date().toISOString(),
              org_id: user?.org_id
            })
          } catch (error) {
            console.error('Error logging workflow execution:', error)
          }
        }
      } catch (error) {
        console.error('Error executing workflow:', error)
        try {
          console.log('Workflow execution failed:', {
            rule_id: workflow.id,
            trigger_data: data,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            org_id: user?.org_id
          })
        } catch (logError) {
          console.error('Error logging workflow failure:', logError)
        }
      }
    }
  }

  const executeWorkflowAction = async (action: WorkflowAction, data: any) => {
    switch (action.type) {
      case 'create_task':
        if (!user?.org_id || !user?.id) {
          throw new Error('Usuario no autenticado')
        }
        
        const taskData: CreateTaskData = {
          title: action.parameters.title,
          description: action.parameters.description,
          case_id: data.case_id,
          client_id: data.client_id,
          priority: action.parameters.priority || 'medium'
        }
        
        const response = await tasksDAL.createTask(taskData, user.org_id, user.id)
        if (!response.success) {
          throw response.error || new Error('Failed to create task')
        }
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
        toast.success(action.parameters.title, {
          description: action.parameters.message
        })
        break

      case 'update_status':
        if (data.case_id) {
          const response = await casesDAL.update(data.case_id, { 
            status: action.parameters.status 
          })
          if (!response.success) {
            throw response.error || new Error('Failed to update case status')
          }
        }
        break
    }
  }

  return {
    executeWorkflow
  }
}
