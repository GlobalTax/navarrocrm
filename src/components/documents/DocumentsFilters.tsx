import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, Star, Grid3X3, List } from 'lucide-react'
import { DocumentTemplate } from '@/hooks/useDocumentTemplates'

interface DocumentsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  practiceAreaFilter: string
  onPracticeAreaFilterChange: (value: string) => void
  showFavorites: boolean
  onShowFavoritesChange: (value: boolean) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  templates: DocumentTemplate[]
  onClearFilters: () => void
}

export const DocumentsFilters = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  practiceAreaFilter,
  onPracticeAreaFilterChange,
  showFavorites,
  onShowFavoritesChange,
  viewMode,
  onViewModeChange,
  templates,
  onClearFilters
}: DocumentsFiltersProps) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  // Extraer opciones únicas de las plantillas
  const uniqueTypes = [...new Set(templates.map(t => t.document_type))]
  const uniqueCategories = [...new Set(templates.map(t => t.category).filter(Boolean))]
  const uniquePracticeAreas = [...new Set(templates.map(t => t.practice_area).filter(Boolean))]

  const activeFiltersCount = [
    typeFilter !== 'all',
    categoryFilter !== 'all',
    practiceAreaFilter !== 'all',
    showFavorites
  ].filter(Boolean).length

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contract': return 'Contratos'
      case 'communication': return 'Comunicaciones'
      case 'procedural': return 'Procesales'
      default: return type
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra principal de búsqueda y vista */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle favoritos */}
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => onShowFavoritesChange(!showFavorites)}
            className="gap-2"
          >
            <Star className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
            Favoritos
          </Button>

          {/* Toggle filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Modo de vista */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none border-r"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros expandidos */}
      {filtersExpanded && (
        <div className="animate-fade-in bg-muted/50 border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Filtros Avanzados</h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Tipo de Documento
              </label>
              <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por categoría */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Categoría
              </label>
              <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por área de práctica */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Área de Práctica
              </label>
              <Select value={practiceAreaFilter} onValueChange={onPracticeAreaFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  {uniquePracticeAreas.map(area => (
                    <SelectItem key={area} value={area!}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Tipo: {getTypeLabel(typeFilter)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onTypeFilterChange('all')}
                  />
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Categoría: {categoryFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onCategoryFilterChange('all')}
                  />
                </Badge>
              )}
              {practiceAreaFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Área: {practiceAreaFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onPracticeAreaFilterChange('all')}
                  />
                </Badge>
              )}
              {showFavorites && (
                <Badge variant="secondary" className="gap-1">
                  Solo favoritos
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onShowFavoritesChange(false)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}