import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, Users, Search, Filter } from 'lucide-react'

interface UserEmptyStateProps {
  hasFilters: boolean
  onInviteUser: () => void
  onClearFilters: () => void
}

export const UserEmptyState = ({ hasFilters, onInviteUser, onClearFilters }: UserEmptyStateProps) => {
  if (hasFilters) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardContent className="text-center py-12">
          <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No hay usuarios que coincidan con los filtros aplicados. 
            Intenta ajustar los criterios de búsqueda.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="border-0.5 border-black rounded-[10px] hover-lift"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
            <Button 
              onClick={onInviteUser}
              className="border-0.5 border-black rounded-[10px] hover-lift"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar usuario
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardContent className="text-center py-16">
        <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          ¡Comienza invitando usuarios!
        </h3>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Tu equipo aparecerá aquí. Invita a tus compañeros para que puedan 
          acceder al sistema y comenzar a colaborar en los casos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onInviteUser}
            className="border-0.5 border-black rounded-[10px] hover-lift"
            size="lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Invitar primer usuario
          </Button>
          <Button 
            variant="outline"
            className="border-0.5 border-black rounded-[10px] hover-lift"
            size="lg"
          >
            <Users className="h-5 w-5 mr-2" />
            Ver guía de configuración
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}