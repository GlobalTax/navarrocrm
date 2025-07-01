
import { Button } from '@/components/ui/button'
import { Users, Plus, Search, Sparkles, Heart, Target } from 'lucide-react'

interface ContactEmptyStateProps {
  hasFilters: boolean
  onCreateContact: () => void
}

export function ContactEmptyState({ hasFilters, onCreateContact }: ContactEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="text-center py-16 px-6">
        <div className="max-w-md mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl inline-block shadow-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No se encontraron contactos
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            No hay contactos que coincidan con los filtros actuales. 
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
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl inline-block shadow-2xl">
            <div className="relative">
              <Users className="h-12 w-12 text-white" />
              <div className="absolute -top-1 -right-1 bg-pink-400 p-1 rounded-full animate-bounce">
                <Heart className="h-3 w-3 text-pink-800" />
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Tu red de contactos te espera!
        </h3>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Los contactos son el corazón de tu negocio. Comienza agregando personas 
          y empresas para construir relaciones que impulsen tu éxito.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onCreateContact}
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Primer Contacto
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 hover:bg-gray-50 transition-colors"
          >
            Importar contactos
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-500">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <span>Organización inteligente</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <Heart className="h-4 w-4 text-pink-600" />
              </div>
              <span>Relaciones duraderas</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <span>Oportunidades de negocio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
