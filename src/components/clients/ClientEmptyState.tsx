
import { Button } from '@/components/ui/button'

interface ClientEmptyStateProps {
  hasFilters: boolean
  onCreateClient: () => void
}

export const ClientEmptyState = ({ hasFilters, onCreateClient }: ClientEmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <div className="text-gray-500 mb-4">
        {hasFilters 
          ? 'No se encontraron clientes con los filtros aplicados' 
          : 'No hay clientes registrados'
        }
      </div>
      {!hasFilters && (
        <Button onClick={onCreateClient}>
          Crear primer cliente
        </Button>
      )}
    </div>
  )
}
