
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
        <Label htmlFor="title">Título de la gestión legal</Label>
        <Input
          id="title"
          placeholder="ej. Redactar demanda de divorcio contencioso"
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción detallada</Label>
        <Textarea
          id="description"
          placeholder="Descripción detallada de la gestión, documentos necesarios, particularidades del caso..."
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado procesal</Label>
          <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Pendiente de asignación
                </div>
              </SelectItem>
              <SelectItem value="investigation">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Investigación y análisis
                </div>
              </SelectItem>
              <SelectItem value="drafting">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Redacción de escritos
                </div>
              </SelectItem>
              <SelectItem value="review">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  Revisión y supervisión
                </div>
              </SelectItem>
              <SelectItem value="filing">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Presentación/Tramitación
                </div>
              </SelectItem>
              <SelectItem value="hearing">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Comparecencia/Audiencia
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Completada
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Urgencia legal</Label>
          <Select value={formData.priority} onValueChange={(value) => onInputChange('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar urgencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <Scale className="h-3 w-3 text-red-600" />
                  <span className="text-red-600 font-medium">Vencimiento crítico</span>
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  Urgente (24-48 horas)
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-orange-500" />
                  Alta (esta semana)
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-yellow-500" />
                  Normal (este mes)
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-green-500" />
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
