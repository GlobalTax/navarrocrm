
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

interface ContactEmptyStateProps {
  hasFilters: boolean
  onCreateContact: () => void
}

export function ContactEmptyState({ hasFilters, onCreateContact }: ContactEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No se encontraron contactos
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Prueba a ajustar los filtros de búsqueda
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        No tienes contactos aún
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Comienza agregando tu primer contacto o prospecto
      </p>
      <Button onClick={onCreateContact}>
        <Plus className="h-4 w-4 mr-2" />
        Crear primer contacto
      </Button>
    </div>
  )
}
