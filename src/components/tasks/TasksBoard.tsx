
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

  const legalColumns = [
    { 
      id: 'pending', 
      title: 'Gestiones Pendientes', 
      color: 'border-yellow-200 bg-yellow-50',
      description: 'Tareas por iniciar'
    },
    { 
      id: 'investigation', 
      title: 'Investigación', 
      color: 'border-blue-200 bg-blue-50',
      description: 'Análisis y documentación'
    },
    { 
      id: 'drafting', 
      title: 'Redacción', 
      color: 'border-purple-200 bg-purple-50',
      description: 'Escritos y documentos'
    },
    { 
      id: 'review', 
      title: 'Revisión', 
      color: 'border-orange-200 bg-orange-50',
      description: 'Supervisión y validación'
    },
    { 
      id: 'filing', 
      title: 'Presentación', 
      color: 'border-green-200 bg-green-50',
      description: 'Tramitación y presentación'
    },
    { 
      id: 'hearing', 
      title: 'Comparecencias', 
      color: 'border-red-200 bg-red-50',
      description: 'Audiencias y vistas'
    }
  ]

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      if (!task || !task.id) {
        console.warn('⚠️ Invalid task found:', task)
        return false
      }
      // Mapear estados genéricos a estados legales
      const statusMapping: { [key: string]: string } = {
        'pending': 'pending',
        'in_progress': 'investigation',
        'completed': 'filing'
      }
      const mappedStatus = statusMapping[task.status] || task.status
      return mappedStatus === status
    }) || []
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {legalColumns.map(column => {
        const columnTasks = getTasksByStatus(column.id)
        
        return (
          <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4 min-h-[400px]`}>
            <div className="flex flex-col mb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{column.title}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                  {columnTasks.length}
                </span>
              </div>
              <p className="text-xs text-gray-600">{column.description}</p>
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
                  <p className="text-xs">No hay gestiones en esta etapa</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
