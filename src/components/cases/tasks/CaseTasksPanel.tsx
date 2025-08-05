
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CaseTasksPanelProps {
  caseId: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'in_progress': return 'bg-blue-100 text-blue-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-600'
    case 'urgent': return 'text-red-500'
    case 'high': return 'text-orange-500'
    case 'medium': return 'text-yellow-500'
    case 'low': return 'text-green-500'
    default: return 'text-gray-500'
  }
}

export const CaseTasksPanel = ({ caseId }: CaseTasksPanelProps) => {
  const { tasks, isLoading } = useTasks()
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  // Filtrar tareas del expediente
  const caseTasks = tasks.filter(task => task.case_id === caseId)
  const pendingTasks = caseTasks.filter(task => task.status === 'pending')
  const completedTasks = caseTasks.filter(task => task.status === 'completed')

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
  }

  const handleCloseTaskDetail = () => {
    setSelectedTask(null)
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setIsNewTaskOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Tareas del Expediente
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setIsNewTaskOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Skeleton className="w-6 h-6 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : caseTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No hay tareas para este expediente</p>
              <Button onClick={() => setIsNewTaskOpen(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Crear primera tarea
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Resumen */}
              <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{caseTasks.length}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
                  <div className="text-xs text-gray-600">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                  <div className="text-xs text-gray-600">Completadas</div>
                </div>
              </div>

              {/* Lista de tareas */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {caseTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex-shrink-0 pt-1">
                      {task.priority === 'critical' || task.priority === 'urgent' ? (
                        <AlertCircle className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                      ) : (
                        <div className={`w-4 h-4 rounded-full ${getPriorityColor(task.priority)} border-2 border-current`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {format(new Date(task.due_date), 'dd MMM', { locale: es })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskFormDialog
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        task={selectedTask}
      />

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={handleCloseTaskDetail}
          onEdit={handleEditTask}
        />
      )}
    </>
  )
}
