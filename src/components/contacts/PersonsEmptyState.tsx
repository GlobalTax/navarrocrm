
import { Button } from '@/components/ui/button'
import { UserPlus, Search } from 'lucide-react'

interface PersonsEmptyStateProps {
  hasFilters: boolean
  onCreatePerson: () => void
}

export const PersonsEmptyState = ({ hasFilters, onCreatePerson }: PersonsEmptyStateProps) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron personas
        </h3>
        <p className="text-gray-600 mb-4">
          Prueba ajustando los filtros de búsqueda
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay personas físicas registradas
      </h3>
      <p className="text-gray-600 mb-4">
        Comienza agregando la primera persona física a tu base de datos
      </p>
      <Button onClick={onCreatePerson}>
        <UserPlus className="h-4 w-4 mr-2" />
        Agregar Primera Persona
      </Button>
    </div>
  )
}
