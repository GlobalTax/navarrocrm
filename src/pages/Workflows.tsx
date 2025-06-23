
import React, { useState, useMemo, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart3, History, Search, Plus, Wand2 } from 'lucide-react'
import { useIntelligentWorkflows } from '@/hooks/useIntelligentWorkflows'
import { WorkflowRulesList } from '@/components/workflows/WorkflowRulesList'
import { WorkflowBuilder } from '@/components/workflows/WorkflowBuilder'
import { WorkflowTemplates } from '@/components/workflows/WorkflowTemplates'
import { WorkflowWizard } from '@/components/workflows/WorkflowWizard'
import { OptimizedWorkflowMetricsDashboard } from '@/components/workflows/OptimizedWorkflowMetricsDashboard'
import { WorkflowPageHeader } from '@/components/workflows/WorkflowPageHeader'
import { WorkflowQuickView } from '@/components/workflows/WorkflowQuickView'
import { WorkflowHistoryView } from '@/components/workflows/WorkflowHistoryView'
import { useOptimizedWorkflowRules } from '@/hooks/useOptimizedWorkflowRules'
import { useWorkflowPageHandlers } from '@/hooks/workflows/useWorkflowPageHandlers'

const WorkflowsPage = React.memo(() => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showBuilder, setShowBuilder] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  
  const {
    rules,
    templates,
    isLoading,
    searchTerm,
    handleSearchChange,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    stats
  } = useOptimizedWorkflowRules()

  const { executions } = useIntelligentWorkflows()

  const {
    editingRule,
    handleSaveRule,
    handleEditRule,
    handleDeleteRule,
    handleUseTemplate,
    handleExecuteRule,
    handleClearEditing
  } = useWorkflowPageHandlers(createRule, updateRule, deleteRule)

  // Memoized handlers
  const handleSaveRuleComplete = useCallback(async (ruleData: any) => {
    const success = await handleSaveRule(ruleData)
    if (success) {
      setShowBuilder(false)
      setShowWizard(false)
    }
  }, [handleSaveRule])

  const handleEditRuleAndShowBuilder = useCallback((rule: any) => {
    handleEditRule(rule)
    setShowBuilder(true)
    setActiveTab('builder')
  }, [handleEditRule])

  const handleUseTemplateAndShowBuilder = useCallback((template: any) => {
    handleUseTemplate(template)
    setShowBuilder(true)
    setActiveTab('builder')
  }, [handleUseTemplate])

  const handleCreateWorkflow = useCallback(() => {
    handleClearEditing()
    setShowBuilder(true)
  }, [handleClearEditing])

  const handleShowWizard = useCallback(() => {
    setShowWizard(true)
  }, [])

  const handleCancelBuilder = useCallback(() => {
    setShowBuilder(false)
    handleClearEditing()
  }, [handleClearEditing])

  const handleCancelWizard = useCallback(() => {
    setShowWizard(false)
  }, [])

  // Memoized metrics
  const workflowMetrics = useMemo(() => {
    const activeRulesCount = stats.active
    const totalExecutions = executions.length
    const successfulExecutions = executions.filter(exec => exec.status === 'completed').length
    const failedExecutions = executions.filter(exec => exec.status === 'failed').length
    const averageExecutionTime = executions.length > 0 ? 2000 : 0
    
    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      timeSaved: successfulExecutions * 15 * 60,
      activeWorkflows: activeRulesCount,
      topPerformingWorkflow: rules.find(rule => rule.is_active)?.name || 'N/A',
      improvementSuggestions: [
        'Considera agregar más condiciones a tus workflows para mayor precisión',
        'Revisa los workflows con mayor tasa de fallos',
        'Añade workflows para procesos manuales repetitivos'
      ]
    }
  }, [stats.active, executions, rules])

  if (showWizard) {
    return (
      <div className="container mx-auto py-8">
        <WorkflowWizard
          onComplete={handleSaveRuleComplete}
          onCancel={handleCancelWizard}
        />
      </div>
    )
  }

  if (showBuilder) {
    return (
      <div className="container mx-auto py-8">
        <WorkflowBuilder
          rule={editingRule}
          onSave={handleSaveRuleComplete}
          onCancel={handleCancelBuilder}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <WorkflowPageHeader
        onCreateWorkflow={handleCreateWorkflow}
        onShowWizard={handleShowWizard}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Mis Workflows
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <OptimizedWorkflowMetricsDashboard 
            metrics={workflowMetrics}
            isLoading={isLoading}
          />
          <WorkflowQuickView rules={rules} executions={executions} />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar workflows..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {rules.length} workflow{rules.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando workflows...</p>
            </div>
          ) : (
            <WorkflowRulesList
              rules={rules}
              onEdit={handleEditRuleAndShowBuilder}
              onDelete={handleDeleteRule}
              onToggle={toggleRule}
              onExecute={handleExecuteRule}
            />
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <WorkflowTemplates
            templates={templates}
            onUseTemplate={handleUseTemplateAndShowBuilder}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <WorkflowHistoryView executions={executions} />
        </TabsContent>
      </Tabs>
    </div>
  )
})

WorkflowsPage.displayName = 'WorkflowsPage'

export default WorkflowsPage
