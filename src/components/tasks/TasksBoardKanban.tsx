
import { useState } from 'react'
import { TaskCard } from './TaskCard'
import { TaskDetailDrawer } from './TaskDetailDrawer'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TaskWithRelations, TaskStatus, STATUS_LABELS } from '@/hooks/tasks/types'
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

  // Columnas del kanban con estados válidos
  const columns: Array<{ 
    id: TaskStatus
    title: string
    color: string
    count: number
  }> = [
    { 
      id: 'pending', 
      title: STATUS_LABELS.pending, 
      color: '',
      count: 0
    },
    { 
      id: 'in_progress', 
      title: STATUS_LABELS.in_progress, 
      color: '',
      count: 0
    },
    { 
      id: 'completed', 
      title: STATUS_LABELS.completed, 
      color: '',
      count: 0
    }
  ]

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => {
      if (!task || !task.id) return false
      return task.status === status
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

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask({ id: taskId, status: newStatus })
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
              className={`group rounded-[10px] border-0.5 border-black bg-white min-h-[500px] flex flex-col shadow-sm animate-fade-in`}
            >
              <div className="flex items-center justify-between p-4 border-b-0.5 border-black/10">
                <h3 className="font-semibold text-black">{column.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-black border-0.5 border-black">
                    {column.count}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCreateTask}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover-lift"
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
                    className="cursor-pointer hover-scale"
                  >
                    <TaskCard
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus as TaskStatus)}
                      showStatusSelector={false}
                    />
                  </div>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-black/50">
                    <p className="text-sm">No hay tareas</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateTask}
                      className="mt-2 text-sm hover-lift border-0.5 border-black rounded-[10px]"
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
