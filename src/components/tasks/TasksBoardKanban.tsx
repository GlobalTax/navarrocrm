
import { useState } from 'react'
import { TaskCard } from './TaskCard'
import { TaskDetailDrawer } from './TaskDetailDrawer'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TaskWithRelations } from '@/hooks/tasks/types'
import { useTasks } from '@/hooks/useTasks'

interface TasksBoardKanbanProps {
  tasks: TaskWithRelations[]
  onEditTask: (task: TaskWithRelations) => void
  onCreateTask: () => void
}

export const TasksBoardKanban = ({ tasks, onEditTask, onCreateTask }: TasksBoardKanbanProps) => {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { updateTask } = useTasks()

  console.log('🔍 TasksBoardKanban received tasks:', tasks?.length || 0)
  
  if (!Array.isArray(tasks)) {
    console.warn('⚠️ TasksBoardKanban received non-array tasks:', tasks)
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Error: Datos de tareas inválidos</p>
      </div>
    )
  }

  const columns = [
    { 
      id: 'pending', 
      title: 'Pendientes', 
      color: 'border-yellow-200 bg-yellow-50',
      count: 0
    },
    { 
      id: 'investigation', 
      title: 'Investigación', 
      color: 'border-purple-200 bg-purple-50',
      count: 0
    },
    { 
      id: 'drafting', 
      title: 'Redacción', 
      color: 'border-blue-200 bg-blue-50',
      count: 0
    },
    { 
      id: 'review', 
      title: 'Revisión', 
      color: 'border-orange-200 bg-orange-50',
      count: 0
    },
    { 
      id: 'filing', 
      title: 'Presentación', 
      color: 'border-indigo-200 bg-indigo-50',
      count: 0
    },
    { 
      id: 'hearing', 
      title: 'Audiencia', 
      color: 'border-red-200 bg-red-50',
      count: 0
    },
    { 
      id: 'completed', 
      title: 'Completadas', 
      color: 'border-green-200 bg-green-50',
      count: 0
    },
    { 
      id: 'cancelled', 
      title: 'Canceladas', 
      color: 'border-gray-200 bg-gray-50',
      count: 0
    }
  ]

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      if (!task || !task.id) {
        console.warn('⚠️ Invalid task found:', task)
        return false
      }
      return task.status === status
    }) || []
  }

  // Actualizar contadores
  columns.forEach(column => {
    column.count = getTasksByStatus(column.id).length
  })

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task)
    setIsDrawerOpen(true)
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask({ id: taskId, status: newStatus as any })
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedTask(null)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 pb-6">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id)
          
          return (
            <div 
              key={column.id} 
              className={`rounded-lg border-2 ${column.color} min-h-[500px] flex flex-col`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                <h3 className="font-semibold text-gray-900 text-sm">{column.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                    {column.count}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCreateTask}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {columnTasks.map(task => {
                  if (!task || !task.id) {
                    console.warn('⚠️ Skipping invalid task in column:', column.id, task)
                    return null
                  }
                  
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="cursor-pointer"
                    >
                      <TaskCard
                        task={task}
                        onEdit={() => onEditTask(task)}
                        onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                        showStatusSelector={false}
                      />
                    </div>
                  )
                })}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-xs">No hay tareas</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateTask}
                      className="mt-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Añadir tarea
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onEdit={onEditTask}
        />
      )}
    </>
  )
}
