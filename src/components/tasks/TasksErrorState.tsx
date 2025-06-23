
interface TasksErrorStateProps {
  error: Error
}

export const TasksErrorState = ({ error }: TasksErrorStateProps) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-red-500 mb-2">Error al cargar las tareas</div>
        <div className="text-gray-500 text-sm">{error.message}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Recargar página
        </button>
      </div>
    </div>
  )
}
