
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CasePhaseManagerProps {
  case_: Case
  expanded?: boolean
}

interface Phase {
  id: string
  name: string
  description: string
  status: 'completed' | 'in_progress' | 'pending'
  progress: number
  estimatedHours: number
  actualHours: number
  tasks: {
    id: string
    name: string
    completed: boolean
    required: boolean
  }[]
}

export function CasePhaseManager({ case_, expanded = false }: CasePhaseManagerProps) {
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: '1',
      name: 'Investigación y Análisis',
      description: 'Recopilación de información y análisis inicial del caso',
      status: 'completed',
      progress: 100,
      estimatedHours: 5,
      actualHours: 4.5,
      tasks: [
        { id: '1-1', name: 'Revisar documentación inicial', completed: true, required: true },
        { id: '1-2', name: 'Investigar precedentes legales', completed: true, required: true },
        { id: '1-3', name: 'Análisis de riesgos', completed: true, required: false },
      ]
    },
    {
      id: '2',
      name: 'Documentación',
      description: 'Preparación de documentos legales y estrategia',
      status: 'in_progress',
      progress: 60,
      estimatedHours: 8,
      actualHours: 6.2,
      tasks: [
        { id: '2-1', name: 'Redactar escrito inicial', completed: true, required: true },
        { id: '2-2', name: 'Preparar documentación probatoria', completed: false, required: true },
        { id: '2-3', name: 'Revisar contratos relacionados', completed: true, required: false },
      ]
    },
    {
      id: '3',
      name: 'Negociación y Gestión',
      description: 'Comunicaciones con la contraparte y gestiones',
      status: 'pending',
      progress: 0,
      estimatedHours: 6,
      actualHours: 0,
      tasks: [
        { id: '3-1', name: 'Contactar con la contraparte', completed: false, required: true },
        { id: '3-2', name: 'Propuesta de acuerdo', completed: false, required: true },
        { id: '3-3', name: 'Sesiones de mediación', completed: false, required: false },
      ]
    },
    {
      id: '4',
      name: 'Cierre y Seguimiento',
      description: 'Finalización del caso y seguimiento posterior',
      status: 'pending',
      progress: 0,
      estimatedHours: 3,
      actualHours: 0,
      tasks: [
        { id: '4-1', name: 'Documentar resolución', completed: false, required: true },
        { id: '4-2', name: 'Comunicar resultado al cliente', completed: false, required: true },
        { id: '4-3', name: 'Archivo del expediente', completed: false, required: true },
      ]
    }
  ])

  const toggleTask = (phaseId: string, taskId: string) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        const updatedTasks = phase.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
        const completedTasks = updatedTasks.filter(t => t.completed).length
        const progress = Math.round((completedTasks / updatedTasks.length) * 100)
        
        return {
          ...phase,
          tasks: updatedTasks,
          progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'
        }
      }
      return phase
    }))
  }

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />
      case 'pending': return <Circle className="h-5 w-5 text-gray-400" />
      default: return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada'
      case 'in_progress': return 'En Progreso'
      case 'pending': return 'Pendiente'
      default: return 'Desconocido'
    }
  }

  if (!expanded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Fases del Expediente
            <Badge variant="outline">
              {phases.filter(p => p.status === 'completed').length} / {phases.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getPhaseIcon(phase.status)}
                  <span className="font-medium">{phase.name}</span>
                </div>
                <div className="flex-1">
                  <Progress value={phase.progress} className="h-2" />
                </div>
                <Badge className={getStatusColor(phase.status)}>
                  {getStatusLabel(phase.status)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {phases.map((phase, index) => (
        <Card key={phase.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPhaseIcon(phase.status)}
                <div>
                  <CardTitle className="text-lg">{phase.name}</CardTitle>
                  <p className="text-sm text-gray-600">{phase.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {phase.actualHours}h / {phase.estimatedHours}h
                  </div>
                  <Progress value={phase.progress} className="w-24 h-2" />
                </div>
                <Badge className={getStatusColor(phase.status)}>
                  {getStatusLabel(phase.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Checklist de Tareas:</h4>
              {phase.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(phase.id, task.id)}
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.name}
                  </span>
                  {task.required && (
                    <Badge variant="outline" className="text-xs">
                      Requerida
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
