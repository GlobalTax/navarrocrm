
import { TaskCard } from './TaskCard'

interface TasksBoardProps {
  tasks: any[]
  onEditTask: (task: any) => void
}

export const TasksBoard = ({ tasks, onEditTask }: TasksBoardProps) => {
  console.log('🔍 TasksBoard received tasks:', tasks?.length || 0)
  
  if (!Array.isArray(tasks)) {
    console.warn('⚠️ TasksBoard received non-array tasks:', tasks)
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
      color: 'border-yellow-200 bg-yellow-50'
    },
    { 
      id: 'in_progress', 
      title: 'En Progreso', 
      color: 'border-blue-200 bg-blue-50'
    },
    { 
      id: 'completed', 
      title: 'Completadas', 
      color: 'border-green-200 bg-green-50'
    },
    { 
      id: 'cancelled', 
      title: 'Canceladas', 
      color: 'border-gray-200 bg-gray-50'
    }
  ]

  const getTasksByStatus = (status: string) => {
    try {
      return tasks.filter(task => {
        if (!task || !task.id) {
          console.warn('⚠️ Invalid task found:', task)
          return false
        }
        
        // Mapear estados adicionales a in_progress
        const inProgressStates = ['in_progress', 'investigation', 'drafting', 'review', 'filing', 'hearing']
        if (status === 'in_progress' && inProgressStates.includes(task.status)) {
          return true
        }
        
        return task.status === status
      }) || []
    } catch (error) {
      console.error('❌ Error filtering tasks by status:', status, error)
      return []
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.id)
        
        return (
          <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4 min-h-[400px]`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {columnTasks.map(task => {
                if (!task || !task.id) {
                  console.warn('⚠️ Skipping invalid task in column:', column.id, task)
                  return null
                }
                
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                  />
                )
              })}
              
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No hay tareas</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
