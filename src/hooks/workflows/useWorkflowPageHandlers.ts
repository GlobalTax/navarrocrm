
import { useCallback, useState } from 'react'
import { useIntelligentWorkflows } from '@/hooks/useIntelligentWorkflows'

export const useWorkflowPageHandlers = (
  createRule: (data: any) => Promise<any>,
  updateRule: (id: string, updates: any) => Promise<any>,
  deleteRule: (id: string) => Promise<any>
) => {
  const [showBuilder, setShowBuilder] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedRule, setSelectedRule] = useState<any>(null)
  const [executions] = useState<any[]>([]) // Mock executions for now
  
  const { executeWorkflow } = useIntelligentWorkflows()

  const handleCreateWorkflow = useCallback(() => {
    setShowBuilder(true)
    setSelectedRule(null)
  }, [])

  const handleShowWizard = useCallback(() => {
    setShowWizard(true)
  }, [])

  const handleShowTemplates = useCallback(() => {
    setShowTemplates(true)
  }, [])

  const handleSelectRule = useCallback((rule: any) => {
    setSelectedRule(rule)
    setShowBuilder(true)
  }, [])

  const handleCloseBuilder = useCallback(() => {
    setShowBuilder(false)
    setSelectedRule(null)
  }, [])

  const handleCloseWizard = useCallback(() => {
    setShowWizard(false)
  }, [])

  const handleCloseTemplates = useCallback(() => {
    setShowTemplates(false)
  }, [])

  const handleRuleCreated = useCallback(async (ruleData: any) => {
    try {
      await createRule(ruleData)
      setShowBuilder(false)
      setShowWizard(false)
      setSelectedRule(null)
      return true
    } catch (error) {
      console.error('Error creating rule:', error)
      return false
    }
  }, [createRule])

  const handleRuleUpdated = useCallback(async (ruleData: any) => {
    try {
      if (selectedRule) {
        await updateRule(selectedRule.id, ruleData)
        setShowBuilder(false)
        setSelectedRule(null)
      }
      return true
    } catch (error) {
      console.error('Error updating rule:', error)
      return false
    }
  }, [updateRule, selectedRule])

  const handleSaveRule = useCallback(async (ruleData: any) => {
    try {
      if (selectedRule) {
        await updateRule(selectedRule.id, ruleData)
      } else {
        await createRule(ruleData)
      }
      setShowBuilder(false)
      setSelectedRule(null)
      return true
    } catch (error) {
      console.error('Error saving rule:', error)
      return false
    }
  }, [selectedRule, updateRule, createRule])

  const handleEditRule = useCallback((rule: any) => {
    setSelectedRule(rule)
    setShowBuilder(true)
  }, [])

  const handleDeleteRule = useCallback(async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta automatización?')) {
      await deleteRule(id)
    }
  }, [deleteRule])

  const handleUseTemplate = useCallback((template: any) => {
    const templateData = template.template_data
    setSelectedRule({
      name: template.name,
      description: template.description,
      trigger_type: templateData.trigger,
      conditions: templateData.conditions || [],
      actions: templateData.actions || [],
      priority: 0,
      is_active: true
    })
    setShowBuilder(true)
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
    setSelectedRule(null)
    setShowBuilder(false)
  }, [])

  return {
    // UI State
    showBuilder,
    showWizard,
    showTemplates,
    selectedRule,
    executions,
    
    // Handlers
    handleCreateWorkflow,
    handleShowWizard,
    handleShowTemplates,
    handleSelectRule,
    handleCloseBuilder,
    handleCloseWizard,
    handleCloseTemplates,
    handleRuleCreated,
    handleRuleUpdated,
    handleSaveRule,
    handleEditRule,
    handleDeleteRule,
    handleUseTemplate,
    handleExecuteRule,
    handleClearEditing
  }
}
