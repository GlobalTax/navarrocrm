
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AdvancedTemplateData } from '@/types/templateTypes'
import { 
  FileText, 
  Mail, 
  Users, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  Eye,
  Settings,
  Zap
} from 'lucide-react'

interface TemplateWizardStep5Props {
  formData: {
    name: string
    description: string
    practice_area_id: string
    template_data: AdvancedTemplateData
  }
  updateTemplateData: (updates: Partial<AdvancedTemplateData>) => void
  onSubmit: () => void
  isCreating: boolean
}

export function TemplateWizardStep5({ 
  formData, 
  updateTemplateData, 
  onSubmit, 
  isCreating 
}: TemplateWizardStep5Props) {
  const { template_data: data } = formData

  const totalHours = data.tasks.reduce((sum, task) => sum + task.estimated_hours, 0)
  const criticalStages = data.stages.filter(stage => stage.is_critical).length
  const automaticTasks = data.tasks.filter(task => task.is_automatic).length

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getComplexityColor = (complexity: string) => {
    const colors = {
      basic: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    }
    return colors[complexity as keyof typeof colors] || colors.basic
  }

  return (
    <div className="space-y-6">
      {/* Vista previa del encabezado */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: data.color }}
              >
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{formData.name}</CardTitle>
                <p className="text-gray-600">{formData.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getComplexityColor(data.complexity)}>
                {data.complexity === 'basic' ? 'Básico' : 
                 data.complexity === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </Badge>
              <div className="flex gap-1">
                {data.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {data.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{data.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{data.estimated_duration_days}</div>
            <div className="text-sm text-gray-600">Días estimados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{data.stages.length}</div>
            <div className="text-sm text-gray-600">Etapas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">{data.tasks.length}</div>
            <div className="text-sm text-gray-600">Tareas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">{totalHours}h</div>
            <div className="text-sm text-gray-600">Horas estimadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Vista previa de etapas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa del Proceso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    stage.is_critical ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium flex items-center gap-2">
                    {stage.name}
                    {stage.is_critical && (
                      <Badge className="bg-orange-100 text-orange-800">Crítica</Badge>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{stage.estimated_days} días</span>
                    <span>{stage.required_documents.length} documentos</span>
                    {stage.default_assignee_role && <span>{stage.default_assignee_role}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tareas de alta prioridad */}
      {data.tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Tareas de Alta Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.tasks
                .filter(task => task.priority === 'critical' || task.priority === 'high')
                .slice(0, 5)
                .map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority === 'critical' ? 'Crítica' : 'Alta'}
                      </Badge>
                      <span className="font-medium">{task.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {task.estimated_hours}h
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuración adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración Adicional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-communications"
              checked={data.auto_communications}
              onCheckedChange={(checked) => updateTemplateData({ auto_communications: !!checked })}
            />
            <Label htmlFor="auto-communications" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Activar comunicaciones automáticas con el cliente
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="client-portal"
              checked={data.client_portal_access}
              onCheckedChange={(checked) => updateTemplateData({ client_portal_access: !!checked })}
            />
            <Label htmlFor="client-portal" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Dar acceso al cliente al portal de seguimiento
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Confirmación final */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ¡Plantilla Lista para Crear!
          </h3>
          <p className="text-green-700 mb-4">
            Una vez creada, esta plantilla estará disponible para crear expedientes 
            con toda la configuración avanzada que has definido.
          </p>
          
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="font-bold text-green-600">{automaticTasks}</div>
              <div className="text-xs text-green-700">Tareas automáticas</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{criticalStages}</div>
              <div className="text-xs text-green-700">Etapas críticas</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{data.billing.typical_expenses.length}</div>
              <div className="text-xs text-green-700">Gastos típicos</div>
            </div>
          </div>

          <Button 
            onClick={onSubmit} 
            disabled={isCreating}
            className="mt-6 px-8 py-3 text-lg"
            size="lg"
          >
            {isCreating ? 'Creando Plantilla...' : 'Crear Plantilla Avanzada'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
