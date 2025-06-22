
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Save } from 'lucide-react'
import { WorkflowRuleDB } from '@/hooks/useWorkflowRules'

interface WorkflowBuilderProps {
  rule?: WorkflowRuleDB
  onSave: (ruleData: any) => void
  onCancel: () => void
}

const triggerOptions = [
  { value: 'case_created', label: 'Caso Creado' },
  { value: 'client_added', label: 'Cliente Añadido' },
  { value: 'task_overdue', label: 'Tarea Vencida' },
  { value: 'proposal_sent', label: 'Propuesta Enviada' },
  { value: 'time_logged', label: 'Tiempo Registrado' }
]

const conditionOperators = [
  { value: 'equals', label: 'Igual a' },
  { value: 'contains', label: 'Contiene' },
  { value: 'greater_than', label: 'Mayor que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'is_null', label: 'Es nulo' }
]

const actionTypes = [
  { value: 'create_task', label: 'Crear Tarea' },
  { value: 'send_email', label: 'Enviar Email' },
  { value: 'update_status', label: 'Actualizar Estado' },
  { value: 'create_notification', label: 'Crear Notificación' },
  { value: 'assign_user', label: 'Asignar Usuario' }
]

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  rule,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    trigger_type: rule?.trigger_type || '',
    priority: rule?.priority || 0,
    is_active: rule?.is_active ?? true,
    conditions: rule?.conditions || [],
    actions: rule?.actions || []
  })

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: 'equals', value: '' }]
    }))
  }

  const updateCondition = (index: number, updates: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) => 
        i === index ? { ...cond, ...updates } : cond
      )
    }))
  }

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }))
  }

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: '', parameters: {} }]
    }))
  }

  const updateAction = (index: number, updates: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      )
    }))
  }

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{rule ? 'Editar Workflow' : 'Crear Nuevo Workflow'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Trigger */}
          <div>
            <Label>Trigger *</Label>
            <Select
              value={formData.trigger_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condiciones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Condiciones</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                <Plus className="w-4 h-4 mr-1" />
                Añadir Condición
              </Button>
            </div>
            {formData.conditions.map((condition, index) => (
              <Card key={index} className="mb-3">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        placeholder="Campo"
                        value={condition.field}
                        onChange={(e) => updateCondition(index, { field: e.target.value })}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, { operator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOperators.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder="Valor"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, { value: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Acciones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Acciones *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAction}>
                <Plus className="w-4 h-4 mr-1" />
                Añadir Acción
              </Button>
            </div>
            {formData.actions.map((action, index) => (
              <Card key={index} className="mb-3">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Select
                      value={action.type}
                      onValueChange={(value) => updateAction(index, { type: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Tipo de acción" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAction(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Parámetros específicos por tipo de acción */}
                  {action.type === 'create_task' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Título de la tarea"
                        value={action.parameters?.title || ''}
                        onChange={(e) => updateAction(index, {
                          parameters: { ...action.parameters, title: e.target.value }
                        })}
                      />
                      <Select
                        value={action.parameters?.priority || 'medium'}
                        onValueChange={(value) => updateAction(index, {
                          parameters: { ...action.parameters, priority: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {action.type === 'send_email' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Asunto"
                        value={action.parameters?.subject || ''}
                        onChange={(e) => updateAction(index, {
                          parameters: { ...action.parameters, subject: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="Plantilla"
                        value={action.parameters?.template || ''}
                        onChange={(e) => updateAction(index, {
                          parameters: { ...action.parameters, template: e.target.value }
                        })}
                      />
                    </div>
                  )}

                  {action.type === 'create_notification' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Título"
                        value={action.parameters?.title || ''}
                        onChange={(e) => updateAction(index, {
                          parameters: { ...action.parameters, title: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="Mensaje"
                        value={action.parameters?.message || ''}
                        onChange={(e) => updateAction(index, {
                          parameters: { ...action.parameters, message: e.target.value }
                        })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-1" />
              Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
