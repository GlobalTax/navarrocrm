
import React, { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit, Play, Clock, Users, FileText, DollarSign } from 'lucide-react'
import { WorkflowRuleDB } from '@/hooks/useWorkflowRules'

interface OptimizedWorkflowCardProps {
  rule: WorkflowRuleDB
  onEdit: (rule: WorkflowRuleDB) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isActive: boolean) => void
  onExecute?: (rule: WorkflowRuleDB) => void
}

const TriggerIcon = React.memo<{ trigger: string }>(({ trigger }) => {
  const icons = {
    case_created: FileText,
    client_added: Users,
    task_overdue: Clock,
    proposal_sent: DollarSign,
    time_logged: Play
  }
  const Icon = icons[trigger as keyof typeof icons] || FileText
  return <Icon className="w-4 h-4" />
})

TriggerIcon.displayName = 'TriggerIcon'

const TriggerLabel = React.memo<{ trigger: string }>(({ trigger }) => {
  const labels = {
    case_created: 'Caso Creado',
    client_added: 'Cliente Añadido',
    task_overdue: 'Tarea Vencida',
    proposal_sent: 'Propuesta Enviada',
    time_logged: 'Tiempo Registrado'
  }
  return <span>{labels[trigger as keyof typeof labels] || trigger}</span>
})

TriggerLabel.displayName = 'TriggerLabel'

const OptimizedWorkflowCard = React.memo<OptimizedWorkflowCardProps>(({
  rule,
  onEdit,
  onDelete,
  onToggle,
  onExecute
}) => {
  const handleEdit = useCallback(() => {
    onEdit(rule)
  }, [onEdit, rule])

  const handleDelete = useCallback(() => {
    onDelete(rule.id)
  }, [onDelete, rule.id])

  const handleToggle = useCallback((checked: boolean) => {
    onToggle(rule.id, checked)
  }, [onToggle, rule.id])

  const handleExecute = useCallback(() => {
    if (onExecute) {
      onExecute(rule)
    }
  }, [onExecute, rule])

  const conditionsCount = Array.isArray(rule.conditions) ? rule.conditions.length : 0
  const actionsCount = Array.isArray(rule.actions) ? rule.actions.length : 0

  return (
    <Card className={!rule.is_active ? 'opacity-60' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TriggerIcon trigger={rule.trigger_type} />
            <div>
              <CardTitle className="text-lg">{rule.name}</CardTitle>
              {rule.description && (
                <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={rule.is_active}
              onCheckedChange={handleToggle}
            />
            <Badge variant={rule.is_active ? 'default' : 'secondary'}>
              {rule.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              <TriggerLabel trigger={rule.trigger_type} />
            </Badge>
            <span className="text-sm text-gray-500">
              {conditionsCount} condición(es), {actionsCount} acción(es)
            </span>
            <span className="text-sm text-gray-500">
              Prioridad: {rule.priority}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onExecute && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExecute}
                disabled={!rule.is_active}
              >
                <Play className="w-4 h-4 mr-1" />
                Ejecutar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

OptimizedWorkflowCard.displayName = 'OptimizedWorkflowCard'

export { OptimizedWorkflowCard }
