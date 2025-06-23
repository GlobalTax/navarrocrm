
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, BarChart3, Clock } from 'lucide-react'
import { OptimizedWorkflowMetricsDashboard } from '@/components/workflows/OptimizedWorkflowMetricsDashboard'
import { WorkflowRulesList } from '@/components/workflows/WorkflowRulesList'
import { WorkflowBuilder } from '@/components/workflows/WorkflowBuilder'
import { WorkflowWizard } from '@/components/workflows/WorkflowWizard'
import { WorkflowTemplates } from '@/components/workflows/WorkflowTemplates'
import { WorkflowPageHeader } from '@/components/workflows/WorkflowPageHeader'
import { WorkflowQuickView } from '@/components/workflows/WorkflowQuickView'
import { WorkflowHistoryView } from '@/components/workflows/WorkflowHistoryView'
import { useOptimizedWorkflowRules } from '@/hooks/useOptimizedWorkflowRules'
import { useWorkflowPageHandlers } from '@/hooks/workflows/useWorkflowPageHandlers'

const Workflows = React.memo(() => {
  const { 
    rules, 
    templates, 
    isLoading, 
    createRule, 
    updateRule, 
    deleteRule, 
    toggleRule 
  } = useOptimizedWorkflowRules()
  
  const {
    showBuilder,
    showWizard,
    showTemplates,
    selectedRule,
    executions,
    handleCreateWorkflow,
    handleShowWizard,
    handleShowTemplates,
    handleSelectRule,
    handleCloseBuilder,
    handleCloseWizard,
    handleCloseTemplates,
    handleRuleCreated,
    handleRuleUpdated,
    handleExecuteRule
  } = useWorkflowPageHandlers(createRule, updateRule, deleteRule)

  // Fix: Ensure description is always present
  const normalizedRules = rules.map(rule => ({
    ...rule,
    description: rule.description || ''
  }))

  // Mock metrics for the dashboard
  const mockMetrics = {
    totalExecutions: 150,
    successfulExecutions: 142,
    failedExecutions: 8,
    averageExecutionTime: 2500,
    timeSaved: 18000,
    activeWorkflows: normalizedRules.filter(r => r.is_active).length,
    topPerformingWorkflow: normalizedRules[0]?.name || 'N/A',
    improvementSuggestions: [
      'Considera optimizar los workflows con más de 5 condiciones',
      'Revisa los workflows que fallan frecuentemente',
      'Añade más automatizaciones para tareas repetitivas'
    ]
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <WorkflowPageHeader 
        onCreateWorkflow={handleCreateWorkflow}
        onShowWizard={handleShowWizard}
      />

      <OptimizedWorkflowMetricsDashboard 
        metrics={mockMetrics}
        isLoading={isLoading}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Reglas Activas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkflowQuickView 
            rules={normalizedRules} 
            executions={executions}
          />
          <WorkflowTemplates 
            templates={templates}
            onUseTemplate={handleRuleCreated}
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <WorkflowRulesList 
            rules={normalizedRules}
            onSelectRule={handleSelectRule}
            onDelete={deleteRule}
            onToggle={toggleRule}
            onExecute={handleExecuteRule}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <WorkflowHistoryView executions={executions} />
        </TabsContent>
      </Tabs>

      {showBuilder && (
        <WorkflowBuilder
          rule={selectedRule}
          onSave={handleRuleCreated}
        />
      )}

      {showWizard && (
        <WorkflowWizard
          onComplete={handleRuleCreated}
        />
      )}

      {showTemplates && (
        <WorkflowTemplates 
          templates={templates}
          onUseTemplate={handleRuleCreated}
          onClose={handleCloseTemplates}
        />
      )}
    </div>
  )
})

Workflows.displayName = 'Workflows'

export default Workflows
