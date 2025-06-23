
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
  const { rules, loading, refetch } = useOptimizedWorkflowRules()
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
    handleRuleUpdated
  } = useWorkflowPageHandlers(refetch)

  // Fix: Ensure description is always present
  const normalizedRules = rules.map(rule => ({
    ...rule,
    description: rule.description || ''
  }))

  return (
    <div className="container mx-auto py-8 space-y-8">
      <WorkflowPageHeader 
        onCreateWorkflow={handleCreateWorkflow}
        onShowWizard={handleShowWizard}
      />

      <OptimizedWorkflowMetricsDashboard />

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
          <WorkflowQuickView rules={normalizedRules} />
          <WorkflowTemplates />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <WorkflowRulesList 
            rules={normalizedRules}
            loading={loading}
            onSelectRule={handleSelectRule}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <WorkflowHistoryView executions={executions} />
        </TabsContent>
      </Tabs>

      {showBuilder && (
        <WorkflowBuilder
          onClose={handleCloseBuilder}
          onSave={handleRuleCreated}
          rule={selectedRule}
        />
      )}

      {showWizard && (
        <WorkflowWizard
          onClose={handleCloseWizard}
          onComplete={handleRuleCreated}
        />
      )}

      {showTemplates && (
        <WorkflowTemplates onClose={handleCloseTemplates} />
      )}
    </div>
  )
})

Workflows.displayName = 'Workflows'

export default Workflows
