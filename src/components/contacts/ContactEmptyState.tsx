
import { Button } from '@/components/ui/button'
import { Users, Plus, Search, Shield, Target, TrendingUp } from 'lucide-react'

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
            <div className="relative bg-slate-100 p-4 rounded-2xl inline-block shadow-sm border border-slate-200">
              <Search className="h-8 w-8 text-slate-600" />
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
              className="hover:bg-gray-50 transition-colors border-gray-300"
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
          <div className="relative bg-blue-50 p-6 rounded-3xl inline-block shadow-sm border border-blue-200">
            <Users className="h-12 w-12 text-blue-600" />
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
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Primer Contacto
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Importar contactos
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-500">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-2 border border-blue-200">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span>Organización inteligente</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-2 border border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <span>Relaciones duraderas</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mb-2 border border-purple-200">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <span>Oportunidades de negocio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
