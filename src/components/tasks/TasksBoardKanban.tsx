
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

  const columns = [
    { 
      id: 'pending', 
      title: 'Por Hacer', 
      color: 'border-yellow-200 bg-yellow-50',
      count: 0
    },
    { 
      id: 'in_progress', 
      title: 'En Curso', 
      color: 'border-blue-200 bg-blue-50',
      count: 0
    },
    { 
      id: 'completed', 
      title: 'Completadas', 
      color: 'border-green-200 bg-green-50',
      count: 0
    }
  ]

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      if (!task || !task.id) return false
      
      // Mapear estados complejos a estados simples
      const statusMapping: { [key: string]: string } = {
        'pending': 'pending',
        'investigation': 'in_progress',
        'drafting': 'in_progress',
        'review': 'in_progress',
        'filing': 'in_progress',
        'hearing': 'in_progress',
        'in_progress': 'in_progress',
        'completed': 'completed',
        'cancelled': 'completed'
      }
      
      return statusMapping[task.status] === status
    })
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id)
          
          return (
            <div 
              key={column.id} 
              className={`rounded-lg border-2 ${column.color} min-h-[500px] flex flex-col`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                    {column.count}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCreateTask}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {columnTasks.map(task => (
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
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No hay tareas</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateTask}
                      className="mt-2 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
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
