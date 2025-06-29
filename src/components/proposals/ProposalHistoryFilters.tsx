
import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Search, Filter, X } from 'lucide-react'

interface ProposalHistoryFiltersProps {
  filters: {
    actionType: string
    dateFrom?: Date
    dateTo?: Date
    search: string
  }
  onFiltersChange: (filters: any) => void
}

export const ProposalHistoryFilters: React.FC<ProposalHistoryFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleClearFilters = () => {
    onFiltersChange({
      actionType: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      search: ''
    })
  }

  const hasActiveFilters = filters.actionType !== 'all' || filters.search || filters.dateFrom || filters.dateTo

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-sm text-gray-700">Filtros del Historial</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar propuesta..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 h-9"
          />
        </div>

        <Select
          value={filters.actionType}
          onValueChange={(value) => onFiltersChange({ ...filters, actionType: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Tipo de acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            <SelectItem value="created">Creada</SelectItem>
            <SelectItem value="status_changed">Estado cambiado</SelectItem>
            <SelectItem value="amount_changed">Importe modificado</SelectItem>
            <SelectItem value="sent">Enviada</SelectItem>
            <SelectItem value="accepted">Aceptada</SelectItem>
            <SelectItem value="updated">Actualizada</SelectItem>
            <SelectItem value="duplicated">Duplicada</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <Input
            type="date"
            placeholder="Desde"
            value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              dateFrom: e.target.value ? new Date(e.target.value) : undefined 
            })}
            className="h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <Input
            type="date"
            placeholder="Hasta"
            value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              dateTo: e.target.value ? new Date(e.target.value) : undefined 
            })}
            className="h-9"
          />
        </div>
      </div>
    </div>
  )
}
