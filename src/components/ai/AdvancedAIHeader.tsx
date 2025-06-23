
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Search } from 'lucide-react'

interface AdvancedAIHeaderProps {
  toolsCount: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  categoryFilter: string
  setCategoryFilter: (category: string) => void
  difficultyFilter: string
  setDifficultyFilter: (difficulty: string) => void
  categories: string[]
}

export const AdvancedAIHeader = React.memo<AdvancedAIHeaderProps>(({
  toolsCount,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  difficultyFilter,
  setDifficultyFilter,
  categories
}) => {
  return (
    <>
      {/* Header mejorado */}
      <div className="text-center lg:text-left">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IA Avanzada</h1>
            <p className="text-gray-600 mt-2">
              Herramientas de inteligencia artificial para optimizar tu despacho
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {toolsCount} Herramientas Disponibles
          </Badge>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar herramientas IA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las dificultades</SelectItem>
              <SelectItem value="Principiante">Principiante</SelectItem>
              <SelectItem value="Intermedio">Intermedio</SelectItem>
              <SelectItem value="Avanzado">Avanzado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
})

AdvancedAIHeader.displayName = 'AdvancedAIHeader'
