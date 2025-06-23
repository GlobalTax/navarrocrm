
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

interface WorkflowExecution {
  id: string
  rule_id: string
  status: string
  executed_at?: string
}

interface WorkflowHistoryViewProps {
  executions: WorkflowExecution[]
}

const WorkflowHistoryView = React.memo<WorkflowHistoryViewProps>(({ executions }) => {
  return (
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
  )
})

WorkflowHistoryView.displayName = 'WorkflowHistoryView'

export { WorkflowHistoryView }
