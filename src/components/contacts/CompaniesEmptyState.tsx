
import { Button } from '@/components/ui/button'
import { Building2, Search } from 'lucide-react'

interface CompaniesEmptyStateProps {
  hasFilters: boolean
  onCreateCompany: () => void
}

export const CompaniesEmptyState = ({ hasFilters, onCreateCompany }: CompaniesEmptyStateProps) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron empresas
        </h3>
        <p className="text-gray-600 mb-4">
          Prueba ajustando los filtros de búsqueda
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay empresas registradas
      </h3>
      <p className="text-gray-600 mb-4">
        Comienza agregando la primera empresa a tu base de datos
      </p>
      <Button onClick={onCreateCompany}>
        <Building2 className="h-4 w-4 mr-2" />
        Agregar Primera Empresa
      </Button>
    </div>
  )
}
