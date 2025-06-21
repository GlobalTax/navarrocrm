
interface DashboardErrorProps {
  error: string
  onRetry: () => void
}

export const DashboardError = ({ error, onRetry }: DashboardErrorProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="text-red-800">
        <p className="font-medium">Error al cargar estadísticas</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={onRetry}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
