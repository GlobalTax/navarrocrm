
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Clock } from 'lucide-react'

interface SearchStatsProps {
  stats: {
    totalItems: number
    filteredItems: number
    hasActiveFilters: boolean
    hasSearchTerm: boolean
    isFiltered: boolean
  }
  isSearching?: boolean
  searchTerm?: string
}

export const SearchStats: React.FC<SearchStatsProps> = ({ stats, isSearching, searchTerm }) => {
  if (!stats.isFiltered && !isSearching) {
    return null
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isSearching ? 'Buscando...' : `${stats.filteredItems} de ${stats.totalItems} resultados`}
              </span>
              {isSearching && (
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
              )}
            </div>
            
            {stats.hasSearchTerm && searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                "{searchTerm}"
              </Badge>
            )}
            
            {stats.hasActiveFilters && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filtros activos
              </Badge>
            )}
          </div>
          
          {stats.filteredItems !== stats.totalItems && (
            <div className="text-xs text-muted-foreground">
              {Math.round((stats.filteredItems / stats.totalItems) * 100)}% mostrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
