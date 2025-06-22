
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useWorkflowRules } from '@/hooks/useWorkflowRules'
import { useIntelligentWorkflows } from '@/hooks/useIntelligentWorkflows'
import { WorkflowRulesList } from '@/components/workflows/WorkflowRulesList'
import { WorkflowBuilder } from '@/components/workflows/WorkflowBuilder'
import { WorkflowTemplates } from '@/components/workflows/WorkflowTemplates'

const WorkflowsPage = () => {
  const [activeTab, setActiveTab] = useState('rules')
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  
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
    if (confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
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
      // Datos de ejemplo para testing
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

  // Métricas de workflows
  const activeRulesCount = rules.filter(rule => rule.is_active).length
  const totalExecutions = executions.length
  const successfulExecutions = executions.filter(exec => exec.status === 'completed').length
  const failedExecutions = executions.filter(exec => exec.status === 'failed').length

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">
            Automatiza procesos y tareas repetitivas en tu asesoría
          </p>
        </div>
        <Button onClick={() => {
          setEditingRule(null)
          setShowBuilder(true)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Workflow
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows Activos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRulesCount}</div>
            <p className="text-xs text-muted-foreground">
              de {rules.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ejecuciones Totales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exitosas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successfulExecutions}</div>
            <p className="text-xs text-muted-foreground">
              {totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0}% tasa de éxito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedExecutions}</div>
            <p className="text-xs text-muted-foreground">
              requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Mis Workflows</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="text-center py-8">
                <p>Cargando workflows...</p>
              </CardContent>
            </Card>
          ) : (
            <WorkflowRulesList
              rules={rules}
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
