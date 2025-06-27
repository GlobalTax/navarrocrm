
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useBulkTaskOperations } from '@/hooks/tasks/useBulkTaskOperations'
import { useCases } from '@/hooks/useCases'
import { useContacts } from '@/hooks/useContacts'
import { TaskInsert } from '@/hooks/tasks/types'
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2,
  Users,
  Calendar,
  Tag,
  CheckCircle,
  Wand2
} from 'lucide-react'

interface TaskPattern {
  title_pattern: string
  description_pattern: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed'
  estimated_hours?: number
  tags?: string[]
  case_id?: string
  contact_id?: string
}

export const TaskWizard = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [pattern, setPattern] = useState<TaskPattern>({
    title_pattern: '',
    description_pattern: '',
    priority: 'medium',
    status: 'pending',
    estimated_hours: 1,
    tags: []
  })
  const [quantities, setQuantities] = useState({
    count: 5,
    prefix: '',
    start_number: 1
  })
  const [generatedTasks, setGeneratedTasks] = useState<TaskInsert[]>([])

  const { createBulkTasks } = useBulkTaskOperations()
  const { cases } = useCases()
  const { contacts } = useContacts()

  const steps = [
    { number: 1, title: 'Patrón de Tareas', icon: Tag },
    { number: 2, title: 'Configuración', icon: Users },
    { number: 3, title: 'Vista Previa', icon: CheckCircle },
    { number: 4, title: 'Confirmación', icon: Calendar }
  ]

  const generateTasks = () => {
    const tasks: TaskInsert[] = []
    
    for (let i = 0; i < quantities.count; i++) {
      const number = quantities.start_number + i
      const task: TaskInsert = {
        title: pattern.title_pattern.replace('[N]', number.toString())
          .replace('[PREFIX]', quantities.prefix),
        description: pattern.description_pattern.replace('[N]', number.toString())
          .replace('[PREFIX]', quantities.prefix),
        priority: pattern.priority,
        status: pattern.status,
        estimated_hours: pattern.estimated_hours,
        case_id: pattern.case_id || null,
        contact_id: pattern.contact_id || null,
        due_date: null,
        created_by: '', // Se asignará en el hook
        org_id: '' // Se asignará en el hook
      }
      tasks.push(task)
    }
    
    setGeneratedTasks(tasks)
  }

  const handleNext = () => {
    if (currentStep === 2) {
      generateTasks()
    }
    setCurrentStep(Math.min(currentStep + 1, 4))
  }

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1))
  }

  const handleSubmit = async () => {
    try {
      await createBulkTasks.mutateAsync({
        tasks: generatedTasks,
        operation_name: `Wizard: ${quantities.count} tareas con patrón`
      })
      
      // Reset wizard
      setCurrentStep(1)
      setPattern({
        title_pattern: '',
        description_pattern: '',
        priority: 'medium',
        status: 'pending',
        estimated_hours: 1,
        tags: []
      })
      setQuantities({ count: 5, prefix: '', start_number: 1 })
      setGeneratedTasks([])
    } catch (error) {
      console.error('Error creating bulk tasks:', error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Define el Patrón de las Tareas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title-pattern">Patrón del Título *</Label>
                  <Input
                    id="title-pattern"
                    value={pattern.title_pattern}
                    onChange={(e) => setPattern({ ...pattern, title_pattern: e.target.value })}
                    placeholder="Ej: [PREFIX] Tarea número [N]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usa [N] para el número y [PREFIX] para el prefijo
                  </p>
                </div>

                <div>
                  <Label htmlFor="description-pattern">Patrón de la Descripción</Label>
                  <Textarea
                    id="description-pattern"
                    value={pattern.description_pattern}
                    onChange={(e) => setPattern({ ...pattern, description_pattern: e.target.value })}
                    placeholder="Descripción de la tarea [N]..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Prioridad</Label>
                  <Select value={pattern.priority} onValueChange={(value: any) => setPattern({ ...pattern, priority: value })}>
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

                <div>
                  <Label>Estado Inicial</Label>
                  <Select value={pattern.status} onValueChange={(value: any) => setPattern({ ...pattern, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimated-hours">Horas Estimadas</Label>
                  <Input
                    id="estimated-hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={pattern.estimated_hours}
                    onChange={(e) => setPattern({ ...pattern, estimated_hours: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Configuración de Generación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="count">Número de Tareas *</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={quantities.count}
                  onChange={(e) => setQuantities({ ...quantities, count: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="prefix">Prefijo</Label>
                <Input
                  id="prefix"
                  value={quantities.prefix}
                  onChange={(e) => setQuantities({ ...quantities, prefix: e.target.value })}
                  placeholder="Ej: PROJ-A"
                />
              </div>

              <div>
                <Label htmlFor="start-number">Número Inicial</Label>
                <Input
                  id="start-number"
                  type="number"
                  min="1"
                  value={quantities.start_number}
                  onChange={(e) => setQuantities({ ...quantities, start_number: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Caso Asociado (Opcional)</Label>
                <Select value={pattern.case_id || ''} onValueChange={(value) => setPattern({ ...pattern, case_id: value || undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar caso..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin caso</SelectItem>
                    {cases?.map((case_) => (
                      <SelectItem key={case_.id} value={case_.id}>
                        {case_.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Contacto Asociado (Opcional)</Label>
                <Select value={pattern.contact_id || ''} onValueChange={(value) => setPattern({ ...pattern, contact_id: value || undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar contacto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin contacto</SelectItem>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Vista Previa de Tareas</h3>
              <Badge variant="outline">{generatedTasks.length} tareas</Badge>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {generatedTasks.slice(0, 10).map((task, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  </div>
                </Card>
              ))}
              
              {generatedTasks.length > 10 && (
                <p className="text-center text-sm text-gray-500 py-2">
                  ... y {generatedTasks.length - 10} tareas más
                </p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">¿Crear las Tareas?</h3>
              <p className="text-gray-600 mt-2">
                Se crearán {generatedTasks.length} tareas según el patrón definido.
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Asistente de Creación Masiva
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-4 mt-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.number 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {currentStep > step.number ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span className="ml-2 text-sm font-medium">{step.title}</span>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStepContent()}

        <Separator />

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep === 4 ? (
            <Button
              onClick={handleSubmit}
              disabled={createBulkTasks.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createBulkTasks.isPending ? 'Creando...' : 'Crear Tareas'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 && !pattern.title_pattern}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
