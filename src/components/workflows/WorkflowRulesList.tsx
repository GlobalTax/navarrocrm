
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit, Play, Clock, Users, FileText, DollarSign } from 'lucide-react'
import { WorkflowRuleDB } from '@/hooks/useWorkflowRules'

interface WorkflowRulesListProps {
  rules: WorkflowRuleDB[]
  onEdit: (rule: WorkflowRuleDB) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isActive: boolean) => void
  onExecute?: (rule: WorkflowRuleDB) => void
}

const getTriggerIcon = (trigger: string) => {
  const icons = {
    case_created: FileText,
    client_added: Users,
    task_overdue: Clock,
    proposal_sent: DollarSign,
    time_logged: Play
  }
  const Icon = icons[trigger as keyof typeof icons] || FileText
  return <Icon className="w-4 h-4" />
}

const getTriggerLabel = (trigger: string) => {
  const labels = {
    case_created: 'Caso Creado',
    client_added: 'Cliente Añadido',
    task_overdue: 'Tarea Vencida',
    proposal_sent: 'Propuesta Enviada',
    time_logged: 'Tiempo Registrado'
  }
  return labels[trigger as keyof typeof labels] || trigger
}

export const WorkflowRulesList: React.FC<WorkflowRulesListProps> = ({
  rules,
  onEdit,
  onDelete,
  onToggle,
  onExecute
}) => {
  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No hay reglas de workflow configuradas</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTriggerIcon(rule.trigger_type)}
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
                  onCheckedChange={(checked) => onToggle(rule.id, checked)}
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
                  {getTriggerLabel(rule.trigger_type)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {rule.conditions.length} condición(es), {rule.actions.length} acción(es)
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
                    onClick={() => onExecute(rule)}
                    disabled={!rule.is_active}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Ejecutar
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(rule)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(rule.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
