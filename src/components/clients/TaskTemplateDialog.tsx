import { useState } from 'react'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { globalLogger } from '@/utils/logging'

interface TaskTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  template?: any
}

export const TaskTemplateDialog = ({ isOpen, onClose, template }: TaskTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    days_before_billing: template?.days_before_billing || 7,
    estimated_hours: template?.estimated_hours || 1,
    priority: template?.priority || 'medium',
    assigned_to: template?.assigned_to || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validación básica
      if (!formData.name.trim()) {
        toast.error('El nombre es requerido')
        return
      }

      globalLogger.info('Guardando plantilla de tarea', { 
        template: { ...formData, isUpdate: !!template } 
      })
      
      // Aquí se implementaría la lógica de guardado real
      // por ahora simulamos la operación
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success(template ? 'Plantilla actualizada correctamente' : 'Plantilla creada correctamente')
      onClose()
    } catch (error) {
      globalLogger.error('Error al guardar plantilla', { error })
      toast.error('Error al guardar la plantilla')
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {template ? 'Editar Plantilla' : 'Nueva Plantilla de Tarea'}
        </DialogTitle>
        <DialogDescription>
          Configura una plantilla para generar tareas automáticamente
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la tarea</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej. Preparar facturación mensual"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe qué se debe hacer en esta tarea..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="days_before">Días antes de facturación</Label>
            <Input
              id="days_before"
              type="number"
              min="1"
              max="30"
              value={formData.days_before_billing}
              onChange={(e) => setFormData({ 
                ...formData, 
                days_before_billing: parseInt(e.target.value) || 7 
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_hours">Horas estimadas</Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.5"
              min="0.5"
              max="40"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({ 
                ...formData, 
                estimated_hours: parseFloat(e.target.value) || 1 
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {template ? 'Actualizar' : 'Crear'} Plantilla
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}