
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ProposalFiltersProps {
  filters: {
    status: string
    search: string
    dateFrom?: Date
    dateTo?: Date
  }
  onFiltersChange: (filters: any) => void
}

export function ProposalFilters({ filters, onFiltersChange }: ProposalFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      search: '',
      dateFrom: undefined,
      dateTo: undefined
    })
  }

  const hasActiveFilters = filters.status || filters.search || filters.dateFrom || filters.dateTo

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Buscar propuestas..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>
      
      <Select value={filters.status} onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="draft">Borrador</SelectItem>
          <SelectItem value="sent">Enviada</SelectItem>
          <SelectItem value="negotiating">Negociando</SelectItem>
          <SelectItem value="won">Ganada</SelectItem>
          <SelectItem value="lost">Perdida</SelectItem>
          <SelectItem value="expired">Expirada</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !filters.dateFrom && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateFrom ? (
              filters.dateTo ? (
                <>
                  {format(filters.dateFrom, "dd MMM", { locale: es })} -{" "}
                  {format(filters.dateTo, "dd MMM yyyy", { locale: es })}
                </>
              ) : (
                format(filters.dateFrom, "dd MMM yyyy", { locale: es })
              )
            ) : (
              "Seleccionar fechas"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: filters.dateFrom, to: filters.dateTo }}
            onSelect={(range) => {
              updateFilter('dateFrom', range?.from)
              updateFilter('dateTo', range?.to)
            }}
            locale={es}
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} size="sm">
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
