
import { useState } from 'react'
import { useWorkflowTasks } from './workflows/useWorkflowTasks'
import { useInactiveCases } from './workflows/useInactiveCases'
import { useProposalSuggestions } from './workflows/useProposalSuggestions'
import { useWorkflowExecution } from './workflows/useWorkflowExecution'
import { WorkflowRule, WorkflowExecution } from './workflows/types'

export const useIntelligentWorkflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { createCaseWorkflowTasks } = useWorkflowTasks()
  const { detectInactiveCases } = useInactiveCases()
  const { generateProposalSuggestions } = useProposalSuggestions()
  const { executeWorkflow: executeWorkflowAction } = useWorkflowExecution()

  const executeWorkflow = async (trigger: string, data: any) => {
    return executeWorkflowAction(trigger, data, workflows)
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

// Re-export types for convenience
export type {
  WorkflowRule,
  WorkflowCondition,
  WorkflowAction,
  WorkflowExecution,
  TaskTemplate,
  InactiveCase,
  ProposalSuggestion
} from './workflows/types'
