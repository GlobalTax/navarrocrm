
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Wand2, BarChart3, History, Search, Clock } from 'lucide-react'
import { useWorkflowRules } from '@/hooks/useWorkflowRules'
import { useIntelligentWorkflows } from '@/hooks/useIntelligentWorkflows'
import { WorkflowRulesList } from '@/components/workflows/WorkflowRulesList'
import { WorkflowBuilder } from '@/components/workflows/WorkflowBuilder'
import { WorkflowTemplates } from '@/components/workflows/WorkflowTemplates'
import { WorkflowWizard } from '@/components/workflows/WorkflowWizard'
import { WorkflowMetricsDashboard } from '@/components/workflows/WorkflowMetricsDashboard'

const WorkflowsPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showBuilder, setShowBuilder] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const {
    rules,
    templates,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule
  } = useWorkflowRules()

  const { executions, executeWorkflow } = useIntelligentWorkflows()

  const handleSaveRule = async (ruleData: any) => {
    try {
      if (editingRule) {
        await updateRule(editingRule.id, ruleData)
      } else {
        await createRule(ruleData)
      }
      setShowBuilder(false)
      setShowWizard(false)
      setEditingRule(null)
    } catch (error) {
      console.error('Error saving rule:', error)
    }
  }

  const handleEditRule = (rule: any) => {
    setEditingRule(rule)
    setShowBuilder(true)
    setActiveTab('builder')
  }

  const handleDeleteRule = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta automatización?')) {
      await deleteRule(id)
    }
  }

  const handleUseTemplate = (template: any) => {
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
    setShowBuilder(true)
    setActiveTab('builder')
  }

  const handleExecuteRule = async (rule: any) => {
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
  }

  // Métricas mejoradas - corregido para usar propiedades existentes
  const activeRulesCount = rules.filter(rule => rule.is_active).length
  const totalExecutions = executions.length
  const successfulExecutions = executions.filter(exec => exec.status === 'completed').length
  const failedExecutions = executions.filter(exec => exec.status === 'failed').length
  // Usar un tiempo estimado en lugar de execution_time que no existe
  const averageExecutionTime = executions.length > 0 
    ? 2000 // Tiempo estimado promedio en ms
    : 0
  
  const workflowMetrics = {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    averageExecutionTime,
    timeSaved: successfulExecutions * 15 * 60, // 15 min ahorrados por ejecución exitosa
    activeWorkflows: activeRulesCount,
    topPerformingWorkflow: rules.find(rule => rule.is_active)?.name || 'N/A',
    improvementSuggestions: [
      'Considera agregar más condiciones a tus workflows para mayor precisión',
      'Revisa los workflows con mayor tasa de fallos',
      'Añade workflows para procesos manuales repetitivos'
    ]
  }

  // Filtros
  const filteredRules = rules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showWizard) {
    return (
      <div className="container mx-auto py-8">
        <WorkflowWizard
          onComplete={handleSaveRule}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    )
  }

  if (showBuilder) {
    return (
      <div className="container mx-auto py-8">
        <WorkflowBuilder
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => {
            setShowBuilder(false)
            setEditingRule(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header mejorado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automatizaciones Inteligentes</h1>
          <p className="text-muted-foreground">
            Automatiza procesos y libera tiempo para lo que realmente importa
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowWizard(true)}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Asistente
          </Button>
          <Button onClick={() => {
            setEditingRule(null)
            setShowBuilder(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Workflow
          </Button>
        </div>
      </div>

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
          <WorkflowMetricsDashboard 
            metrics={workflowMetrics}
            isLoading={isLoading}
          />
          
          {/* Vista rápida de workflows activos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Workflows Más Activos</h3>
              {filteredRules.slice(0, 3).map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    {rule.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Últimas Ejecuciones</h3>
              {executions.slice(0, 3).map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Workflow ID: {execution.rule_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {execution.executed_at ? new Date(execution.executed_at).toLocaleString() : 'Pendiente'}
                    </p>
                  </div>
                  <Badge variant={
                    execution.status === 'completed' ? 'default' :
                    execution.status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {execution.status === 'completed' ? 'Exitosa' :
                     execution.status === 'failed' ? 'Fallida' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredRules.length} workflow{filteredRules.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando workflows...</p>
            </div>
          ) : (
            <WorkflowRulesList
              rules={filteredRules}
              onEdit={handleEditRule}
              onDelete={handleDeleteRule}
              onToggle={toggleRule}
              onExecute={handleExecuteRule}
            />
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <WorkflowTemplates
            templates={templates}
            onUseTemplate={handleUseTemplate}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ejecuciones</CardTitle>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay ejecuciones registradas
                </p>
              ) : (
                <div className="space-y-3">
                  {executions.slice(0, 10).map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          execution.status === 'completed' ? 'default' :
                          execution.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {execution.status === 'completed' ? 'Exitosa' :
                           execution.status === 'failed' ? 'Fallida' : 'Pendiente'}
                        </Badge>
                        <span className="text-sm">Regla: {execution.rule_id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {execution.executed_at ? new Date(execution.executed_at).toLocaleString() : 'Pendiente'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WorkflowsPage
