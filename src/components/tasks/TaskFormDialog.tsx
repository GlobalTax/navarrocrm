
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useTasks } from '@/hooks/useTasks'
import { useClients } from '@/hooks/useClients'
import { useCases } from '@/hooks/useCases'
import { useUsers } from '@/hooks/useUsers'
import { useApp } from '@/contexts/AppContext'

interface TaskFormDialogProps {
  isOpen: boolean
  onClose: () => void
  task?: any
}

export const TaskFormDialog = ({ isOpen, onClose, task }: TaskFormDialogProps) => {
  const { user } = useApp()
  const { createTask, updateTask, isCreating, isUpdating } = useTasks()
  const { clients } = useClients()
  const { cases } = useCases()
  const { users } = useUsers()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    start_date: '',
    estimated_hours: 0,
    case_id: '',
    client_id: '',
    assigned_to: ''
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        start_date: task.start_date ? task.start_date.split('T')[0] : '',
        estimated_hours: task.estimated_hours || 0,
        case_id: task.case_id || '',
        client_id: task.client_id || '',
        assigned_to: task.task_assignments?.[0]?.user_id || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        start_date: '',
        estimated_hours: 0,
        case_id: '',
        client_id: '',
        assigned_to: ''
      })
    }
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority as any,
      status: formData.status as any,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      estimated_hours: Number(formData.estimated_hours),
      case_id: formData.case_id || null,
      client_id: formData.client_id || null,
      created_by: user?.id,
      org_id: user?.org_id
    }

    if (task) {
      updateTask({ id: task.id, ...taskData })
    } else {
      createTask(taskData)
    }
    
    onClose()
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Título de la tarea"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción de la tarea"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Horas Estimadas</Label>
              <Input
                id="estimated_hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha Límite</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="case_id">Caso</Label>
              <Select value={formData.case_id} onValueChange={(value) => handleInputChange('case_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar caso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin caso</SelectItem>
                  {cases?.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin cliente</SelectItem>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {task ? 'Actualizar' : 'Crear'} Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
