
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimeTrackingFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  caseFilter: string
  onCaseFilterChange: (filter: string) => void
  billableFilter: string
  onBillableFilterChange: (filter: string) => void
  onClearFilters: () => void
}

export function TimeTrackingFilters({
  searchTerm,
  onSearchChange,
  caseFilter,
  onCaseFilterChange,
  billableFilter,
  onBillableFilterChange,
  onClearFilters
}: TimeTrackingFiltersProps) {
  const hasActiveFilters = searchTerm || caseFilter !== 'all' || billableFilter !== 'all'

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por descripción, caso o cliente..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={caseFilter} onValueChange={onCaseFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por caso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los casos</SelectItem>
              <SelectItem value="none">Sin caso asignado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={billableFilter} onValueChange={onBillableFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo de tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el tiempo</SelectItem>
              <SelectItem value="billable">Solo facturable</SelectItem>
              <SelectItem value="non-billable">Solo no facturable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {searchTerm && (
              <Badge variant="secondary">
                Búsqueda: "{searchTerm}"
              </Badge>
            )}
            {caseFilter !== 'all' && (
              <Badge variant="secondary">
                Caso: {caseFilter === 'none' ? 'Sin asignar' : caseFilter}
              </Badge>
            )}
            {billableFilter !== 'all' && (
              <Badge variant="secondary">
                Tipo: {billableFilter === 'billable' ? 'Facturable' : 'No facturable'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
