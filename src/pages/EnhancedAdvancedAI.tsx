
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { EnhancedAIToolsView } from '@/components/ai/EnhancedAIToolsView'
import { AIWorkflowPanel } from '@/components/ai/AIWorkflowPanel'
import { AIAnalyticsPanel } from '@/components/ai/AIAnalyticsPanel'
import { useEnhancedAIState } from '@/hooks/ai/useEnhancedAIState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Workflow, Zap, TrendingUp } from 'lucide-react'

const EnhancedAdvancedAI = () => {
  const {
    // Filtros
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    categoryFilter,
    setCategoryFilter,
    showOnlyEnabled,
    setShowOnlyEnabled,
    showOnlyPopular,
    setShowOnlyPopular,
    clearFilters,
    
    // Herramientas
    filteredTools,
    isToolRunning,
    runningToolProgress,
    selectedTool,
    executeTool,
    
    // Workflows
    workflows,
    workflowTemplates,
    activeWorkflow,
    workflowProgress,
    currentWorkflowStep,
    createWorkflowFromTemplate,
    executeWorkflow,
    
    // Analytics
    analytics,
    recommendations,
    isLoadingAnalytics,
    generateAnalytics,
    
    // Utilidades
    categories,
    toolStats,
  } = useEnhancedAIState()

  const difficultyOptions = [
    { label: 'Todas las dificultades', value: 'all' },
    { label: 'Básico', value: 'basic' },
    { label: 'Intermedio', value: 'intermediate' },
    { label: 'Avanzado', value: 'advanced' }
  ]

  const categoryOptions = [
    { label: 'Todas las categorías', value: 'all' },
    ...categories.map(cat => ({ label: cat, value: cat }))
  ]

  const hasActiveFilters = Boolean(
    searchTerm || 
    categoryFilter !== 'all' || 
    difficultyFilter !== 'all' ||
    showOnlyEnabled ||
    showOnlyPopular
  )

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="IA Avanzada Híbrida"
        description="Sistema inteligente con herramientas IA, workflows automatizados y analytics predictivos"
        primaryAction={{
          label: 'Generar Analytics',
          onClick: generateAnalytics
        }}
        secondaryAction={{
          label: 'Ver Workflows',
          onClick: () => {},
          variant: 'outline'
        }}
      />

      {/* Indicadores de estado */}
      <div className="flex items-center gap-4 mb-6">
        {isToolRunning && (
          <Badge variant="secondary" className="animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            Ejecutando herramienta...
          </Badge>
        )}
        {activeWorkflow && (
          <Badge variant="secondary" className="animate-pulse">
            <Workflow className="h-3 w-3 mr-1" />
            Workflow activo
          </Badge>
        )}
        {analytics && (
          <Badge variant="outline">
            <TrendingUp className="h-3 w-3 mr-1" />
            {Math.round(analytics.userEfficiency * 100)}% eficiencia
          </Badge>
        )}
      </div>

      {/* Filtros mejorados */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Buscar herramientas, workflows, o funcionalidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value as any)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {difficultyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showOnlyEnabled}
            onChange={(e) => setShowOnlyEnabled(e.target.checked)}
            className="rounded"
          />
          Solo habilitadas
        </label>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showOnlyPopular}
            onChange={(e) => setShowOnlyPopular(e.target.checked)}
            className="rounded"
          />
          Solo populares
        </label>
        
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline" size="sm">
            Limpiar filtros
          </Button>
        )}
      </div>

      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Herramientas IA ({filteredTools.length})
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflows ({workflows.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          <EnhancedAIToolsView
            filteredTools={filteredTools}
            isToolRunning={isToolRunning}
            runningToolProgress={runningToolProgress}
            selectedTool={selectedTool}
            onExecuteTool={executeTool}
            toolStats={toolStats}
          />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <AIWorkflowPanel
            workflows={workflows}
            workflowTemplates={workflowTemplates}
            activeWorkflow={activeWorkflow}
            workflowProgress={workflowProgress}
            currentWorkflowStep={currentWorkflowStep}
            onExecuteWorkflow={executeWorkflow}
            onCreateFromTemplate={createWorkflowFromTemplate}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AIAnalyticsPanel
            analytics={analytics}
            recommendations={recommendations}
            isLoading={isLoadingAnalytics}
            onRefresh={generateAnalytics}
          />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}

export default EnhancedAdvancedAI
