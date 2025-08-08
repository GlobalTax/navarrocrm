
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Scale, AlertTriangle, Clock, FileText } from 'lucide-react'

interface TaskBasicFieldsProps {
  formData: {
    title: string
    description: string
    priority: string
    status: string
  }
  onInputChange: (field: string, value: string) => void
}

export const TaskBasicFields = ({ formData, onInputChange }: TaskBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título de la tarea</Label>
        <Input
          id="title"
          placeholder="ej. Revisar contrato de servicios"
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          required
          className="border-0.5 border-black rounded-[10px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Descripción detallada de la tarea..."
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={3}
          className="border-0.5 border-black rounded-[10px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
            <SelectTrigger className="border-0.5 border-black rounded-[10px] bg-white">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  Pendiente
                </div>
              </SelectItem>
              <SelectItem value="in_progress">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  En progreso
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  Completada
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  Cancelada
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select value={formData.priority} onValueChange={(value) => onInputChange('priority', value)}>
            <SelectTrigger className="border-0.5 border-black rounded-[10px] bg-white">
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  Urgente
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Alta
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Media
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Baja
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
