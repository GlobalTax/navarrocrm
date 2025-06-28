
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, Calendar, User, DollarSign, Clock } from 'lucide-react'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

interface AdvancedTimeTrackingFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  caseFilter: string
  onCaseFilterChange: (filter: string) => void
  billableFilter: string
  onBillableFilterChange: (filter: string) => void
  onClearFilters: () => void
}

export function AdvancedTimeTrackingFilters({
  searchTerm,
  onSearchChange,
  caseFilter,
  onCaseFilterChange,
  billableFilter,
  onBillableFilterChange,
  onClearFilters
}: AdvancedTimeTrackingFiltersProps) {
  const hasActiveFilters = searchTerm || caseFilter !== 'all' || billableFilter !== 'all'

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Primera fila - Búsqueda principal */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por descripción, caso o cliente..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500"
              />
            </div>
            
            {hasActiveFilters && (
              <Button variant="outline" size="default" onClick={onClearFilters} className="shrink-0">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Segunda fila - Filtros específicos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select value={caseFilter} onValueChange={onCaseFilterChange}>
              <SelectTrigger className="h-9">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-400" />
                  <SelectValue placeholder="Caso" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los casos</SelectItem>
                <SelectItem value="none">Sin caso asignado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={billableFilter} onValueChange={onBillableFilterChange}>
              <SelectTrigger className="h-9">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-gray-400" />
                  <SelectValue placeholder="Facturación" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="billable">Solo facturables</SelectItem>
                <SelectItem value="non-billable">No facturables</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="h-9">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <SelectValue placeholder="Periodo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="yesterday">Ayer</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="h-9">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <SelectValue placeholder="Duración" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier duración</SelectItem>
                <SelectItem value="short">Menos de 30min</SelectItem>
                <SelectItem value="medium">30min - 2h</SelectItem>
                <SelectItem value="long">Más de 2h</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Search className="h-3 w-3 mr-1" />
                  "{searchTerm}"
                </Badge>
              )}
              {caseFilter !== 'all' && (
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  <User className="h-3 w-3 mr-1" />
                  {caseFilter === 'none' ? 'Sin caso' : 'Caso específico'}
                </Badge>
              )}
              {billableFilter !== 'all' && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {billableFilter === 'billable' ? 'Facturable' : 'No facturable'}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
