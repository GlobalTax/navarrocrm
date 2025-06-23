
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OptimizedWorkflowMetricsDashboard } from '@/components/workflows/OptimizedWorkflowMetricsDashboard'
import { WorkflowRulesList } from '@/components/workflows/WorkflowRulesList'
import { WorkflowBuilder } from '@/components/workflows/WorkflowBuilder'
import { WorkflowWizard } from '@/components/workflows/WorkflowWizard'
import { WorkflowTemplates } from '@/components/workflows/WorkflowTemplates'
import { WorkflowQuickView } from '@/components/workflows/WorkflowQuickView'
import { WorkflowHistoryView } from '@/components/workflows/WorkflowHistoryView'
import { useOptimizedWorkflowRules } from '@/hooks/useOptimizedWorkflowRules'
import { useWorkflowPageHandlers } from '@/hooks/workflows/useWorkflowPageHandlers'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'

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
    <StandardPageContainer>
      <StandardPageHeader
        title="Automatizaciones Inteligentes"
        description="Automatiza procesos y libera tiempo para lo que realmente importa"
        primaryAction={{
          label: 'Crear Workflow',
          onClick: handleCreateWorkflow
        }}
        secondaryAction={{
          label: 'Asistente',
          onClick: handleShowWizard,
          variant: 'outline'
        }}
      />

      <OptimizedWorkflowMetricsDashboard 
        metrics={mockMetrics}
        isLoading={isLoading}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            Vista General
          </TabsTrigger>
          <TabsTrigger value="rules">
            Reglas Activas
          </TabsTrigger>
          <TabsTrigger value="history">
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
          onCancel={handleCloseBuilder}
        />
      )}

      {showWizard && (
        <WorkflowWizard
          onComplete={handleRuleCreated}
          onCancel={handleCloseWizard}
        />
      )}

      {showTemplates && (
        <WorkflowTemplates 
          templates={templates}
          onUseTemplate={handleRuleCreated}
          onClose={handleCloseTemplates}
        />
      )}
    </StandardPageContainer>
  )
})

Workflows.displayName = 'Workflows'

export default Workflows
