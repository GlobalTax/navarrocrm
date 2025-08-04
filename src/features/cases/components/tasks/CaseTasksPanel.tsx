import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Plus, Calendar, Clock, User, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CaseTasksPanelProps {
  caseId: string
}

// Mock tasks - replace with actual hook when available
const mockTasks = [
  {
    id: '1',
    title: 'Revisión de documentos iniciales',
    description: 'Revisar contratos y documentación proporcionada por el cliente',
    status: 'completed',
    priority: 'high',
    assignee: 'María García',
    due_date: '2024-01-15',
    completed_at: '2024-01-14',
    estimated_hours: 4,
    actual_hours: 3.5
  },
  {
    id: '2',
    title: 'Preparar respuesta legal',
    description: 'Redactar respuesta formal basada en la documentación revisada',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Juan Pérez',
    due_date: '2024-01-20',
    estimated_hours: 8,
    actual_hours: 2
  },
  {
    id: '3',
    title: 'Contactar con testigos',
    description: 'Realizar entrevistas con los testigos identificados',
    status: 'pending',
    priority: 'medium',
    assignee: 'Ana López',
    due_date: '2024-01-25',
    estimated_hours: 6,
    actual_hours: 0
  }
]

export const CaseTasksPanel = ({ caseId }: CaseTasksPanelProps) => {
  const [tasks] = useState(mockTasks) // Replace with useTasks(caseId) when available

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada'
      case 'in_progress': return 'En progreso'
      case 'pending': return 'Pendiente'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Tareas del Expediente</h3>
            <Badge variant="outline">
              {completedTasks} de {totalTasks} completadas
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progressPercentage} className="w-48 h-2" />
            <span className="text-sm text-muted-foreground">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.status === 'completed'}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assignee}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.actual_hours}h / {task.estimated_hours}h
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {getStatusLabel(task.status)}
                      </Badge>
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No hay tareas creadas</h3>
                <p className="text-sm text-muted-foreground">
                  Crea la primera tarea para comenzar a organizar el trabajo de este expediente.
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Primera Tarea
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}