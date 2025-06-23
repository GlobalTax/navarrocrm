
import { Button } from '@/components/ui/button'

interface TasksEmptyStateProps {
  onCreateTask: () => void
}

export const TasksEmptyState = ({ onCreateTask }: TasksEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay tareas
        </h3>
        <p className="text-gray-500 mb-6">
          Comienza creando tu primera tarea para organizar tu trabajo.
        </p>
        <Button onClick={onCreateTask}>
          Crear primera tarea
        </Button>
      </div>
    </div>
  )
}
