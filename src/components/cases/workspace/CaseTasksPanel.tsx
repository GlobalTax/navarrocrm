
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Clock, User, Flag } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseTasksPanelProps {
  case_: Case
}

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  phase: string
}

export function CaseTasksPanel({ case_ }: CaseTasksPanelProps) {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Revisar documentación inicial',
      description: 'Análisis completo de contratos y documentos proporcionados',
      status: 'completed',
      priority: 'high',
      assignedTo: 'Ana García',
      dueDate: '2024-01-15',
      estimatedHours: 2,
      actualHours: 1.5,
      phase: 'Investigación'
    },
    {
      id: '2',
      title: 'Preparar documentación probatoria',
      description: 'Recopilar y organizar todas las pruebas relevantes',
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'Carlos López',
      dueDate: '2024-01-20',
      estimatedHours: 4,
      actualHours: 2.5,
      phase: 'Documentación'
    },
    {
      id: '3',
      title: 'Contactar con la contraparte',
      description: 'Establecer comunicación inicial para negociación',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-01-25',
      estimatedHours: 1,
      phase: 'Negociación'
    }
  ])

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada'
      case 'in_progress': return 'En Progreso'
      case 'pending': return 'Pendiente'
      default: return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente'
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return priority
    }
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium">{task.title}</h4>
            <Badge className={getPriorityColor(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600">{task.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              {task.assignedTo && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {task.assignedTo}
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {task.phase}
            </Badge>
          </div>
          
          {task.estimatedHours && (
            <div className="text-xs text-gray-500">
              Tiempo: {task.actualHours || 0}h / {task.estimatedHours}h
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const KanbanView = () => (
    <div className="grid grid-cols-3 gap-6">
      {['pending', 'in_progress', 'completed'].map((status) => (
        <div key={status}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{getStatusLabel(status)}</h3>
            <Badge variant="outline">
              {tasks.filter(t => t.status === status).length}
            </Badge>
          </div>
          <div className="space-y-3">
            {tasks
              .filter(task => task.status === status)
              .map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>
      ))}
    </div>
  )

  const ListView = () => (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg">
          <Badge className={getStatusColor(task.status)}>
            {getStatusLabel(task.status)}
          </Badge>
          <div className="flex-1">
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {task.assignedTo}
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            <Badge className={getPriorityColor(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tareas del Expediente</h2>
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'kanban')}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
    </div>
  )
}
