
import { TaskCard } from './TaskCard'

interface TasksBoardProps {
  tasks: any[]
  onEditTask: (task: any) => void
}

export const TasksBoard = ({ tasks, onEditTask }: TasksBoardProps) => {
  const columns = [
    { id: 'pending', title: 'Pendientes', color: 'border-yellow-200 bg-yellow-50' },
    { id: 'in_progress', title: 'En Progreso', color: 'border-blue-200 bg-blue-50' },
    { id: 'completed', title: 'Completadas', color: 'border-green-200 bg-green-50' },
    { id: 'cancelled', title: 'Canceladas', color: 'border-gray-200 bg-gray-50' }
  ]

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map(column => (
        <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
              {getTasksByStatus(column.id).length}
            </span>
          </div>
          
          <div className="space-y-3">
            {getTasksByStatus(column.id).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
