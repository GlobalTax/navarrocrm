
import { useCallback, useState } from 'react'
import { useIntelligentWorkflows } from '@/hooks/useIntelligentWorkflows'

export const useWorkflowPageHandlers = (
  createRule: (data: any) => Promise<any>,
  updateRule: (id: string, updates: any) => Promise<any>,
  deleteRule: (id: string) => Promise<any>
) => {
  const [editingRule, setEditingRule] = useState<any>(null)
  const { executeWorkflow } = useIntelligentWorkflows()

  const handleSaveRule = useCallback(async (ruleData: any) => {
    try {
      if (editingRule) {
        await updateRule(editingRule.id, ruleData)
      } else {
        await createRule(ruleData)
      }
      setEditingRule(null)
      return true
    } catch (error) {
      console.error('Error saving rule:', error)
      return false
    }
  }, [editingRule, updateRule, createRule])

  const handleEditRule = useCallback((rule: any) => {
    setEditingRule(rule)
  }, [])

  const handleDeleteRule = useCallback(async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta automatización?')) {
      await deleteRule(id)
    }
  }, [deleteRule])

  const handleUseTemplate = useCallback((template: any) => {
    const templateData = template.template_data
    setEditingRule({
      name: template.name,
      description: template.description,
      trigger_type: templateData.trigger,
      conditions: templateData.conditions || [],
      actions: templateData.actions || [],
      priority: 0,
      is_active: true
    })
  }, [])

  const handleExecuteRule = useCallback(async (rule: any) => {
    try {
      const testData = {
        case_id: 'test-case-id',
        client_id: 'test-client-id',
        task_id: 'test-task-id'
      }
      await executeWorkflow(rule.trigger_type, testData)
    } catch (error) {
      console.error('Error executing workflow:', error)
    }
  }, [executeWorkflow])

  const handleClearEditing = useCallback(() => {
    setEditingRule(null)
  }, [])

  return {
    editingRule,
    handleSaveRule,
    handleEditRule,
    handleDeleteRule,
    handleUseTemplate,
    handleExecuteRule,
    handleClearEditing
  }
}
