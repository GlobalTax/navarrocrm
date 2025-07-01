
import { Button } from '@/components/ui/button'
import { UserPlus, Search, Users, Sparkles } from 'lucide-react'

interface PersonsEmptyStateProps {
  hasFilters: boolean
  onCreatePerson: () => void
}

export const PersonsEmptyState = ({ hasFilters, onCreatePerson }: PersonsEmptyStateProps) => {
  if (hasFilters) {
    return (
      <div className="text-center py-16 px-6">
        <div className="max-w-md mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl inline-block shadow-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No se encontraron personas
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            No hay personas que coincidan con los filtros actuales. 
            Prueba ajustando los criterios de búsqueda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              className="hover:bg-gray-50 transition-colors"
              onClick={() => window.location.reload()}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-20 px-6">
      <div className="max-w-lg mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-3xl inline-block shadow-2xl">
            <div className="relative">
              <Users className="h-12 w-12 text-white" />
              <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full">
                <Sparkles className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Empieza tu red de contactos!
        </h3>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Las personas físicas son la base de tu negocio. Agrega tu primera persona 
          y comienza a construir relaciones sólidas y duraderas.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onCreatePerson}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Agregar Primera Persona
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 hover:bg-gray-50 transition-colors"
          >
            Ver guía rápida
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-500">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span>Gestión centralizada</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <UserPlus className="h-4 w-4 text-green-600" />
              </div>
              <span>Seguimiento automático</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <span>Análisis inteligente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
