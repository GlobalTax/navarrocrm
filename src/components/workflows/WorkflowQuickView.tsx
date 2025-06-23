
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { WorkflowRuleDB } from '@/hooks/useOptimizedWorkflowRules'

interface WorkflowExecution {
  id: string
  rule_id: string
  status: string
  executed_at?: string
}

interface WorkflowQuickViewProps {
  rules: WorkflowRuleDB[]
  executions?: WorkflowExecution[]
}

const WorkflowQuickView = React.memo<WorkflowQuickViewProps>(({ rules, executions = [] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Workflows Más Activos</h3>
        {rules.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay workflows configurados</p>
        ) : (
          rules.slice(0, 3).map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="text-sm text-muted-foreground">{rule.description}</p>
              </div>
              <Badge variant={rule.is_active ? "default" : "secondary"}>
                {rule.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          ))
        )}
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Últimas Ejecuciones</h3>
        {executions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay ejecuciones registradas</p>
        ) : (
          executions.slice(0, 3).map((execution) => (
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
          ))
        )}
      </div>
    </div>
  )
})

WorkflowQuickView.displayName = 'WorkflowQuickView'

export { WorkflowQuickView }
