
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar as CalendarIcon, Filter, RotateCcw, Download, RefreshCw } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AnalyticsFiltersProps {
  timeRange: string
  onTimeRangeChange: (value: string) => void
  dateRange?: DateRange
  onDateRangeChange: (range: DateRange | undefined) => void
  eventTypes: string[]
  selectedEventTypes: string[]
  onEventTypesChange: (types: string[]) => void
  userTypes: string[]
  selectedUserTypes: string[]
  onUserTypesChange: (types: string[]) => void
  pages: string[]
  selectedPages: string[]
  onPagesChange: (pages: string[]) => void
  errorTypes: string[]
  selectedErrorTypes: string[]
  onErrorTypesChange: (types: string[]) => void
  onReset: () => void
  onExport: () => void
  onRefresh: () => void
  isLoading: boolean
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  timeRange,
  onTimeRangeChange,
  dateRange,
  onDateRangeChange,
  eventTypes,
  selectedEventTypes,
  onEventTypesChange,
  userTypes,
  selectedUserTypes,
  onUserTypesChange,
  pages,
  selectedPages,
  onPagesChange,
  errorTypes,
  selectedErrorTypes,
  onErrorTypesChange,
  onReset,
  onExport,
  onRefresh,
  isLoading
}) => {
  const handleEventTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      onEventTypesChange([...selectedEventTypes, type])
    } else {
      onEventTypesChange(selectedEventTypes.filter(t => t !== type))
    }
  }

  const handleUserTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      onUserTypesChange([...selectedUserTypes, type])
    } else {
      onUserTypesChange(selectedUserTypes.filter(t => t !== type))
    }
  }

  const handlePageChange = (page: string, checked: boolean) => {
    if (checked) {
      onPagesChange([...selectedPages, page])
    } else {
      onPagesChange(selectedPages.filter(p => p !== page))
    }
  }

  const handleErrorTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      onErrorTypesChange([...selectedErrorTypes, type])
    } else {
      onErrorTypesChange(selectedErrorTypes.filter(t => t !== type))
    }
  }

  const getActiveFiltersCount = () => {
    return selectedEventTypes.length + 
           selectedUserTypes.length + 
           selectedPages.length + 
           selectedErrorTypes.length +
           (dateRange?.from ? 1 : 0)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Primera fila: Controles principales */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Rango de tiempo */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Período:</span>
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Última hora</SelectItem>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selector de fechas personalizado */}
            {timeRange === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                          {format(dateRange.to, "dd MMM", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM", { locale: es })
                      )
                    ) : (
                      "Seleccionar fechas"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={onDateRangeChange}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Controles de acción */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear
              </Button>
            </div>
          </div>

          {/* Segunda fila: Filtros avanzados */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
            
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} activos
              </Badge>
            )}
          </div>

          {/* Tercera fila: Checkboxes de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipos de eventos */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tipos de Eventos</h4>
              <div className="space-y-1">
                {eventTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`event-${type}`}
                      checked={selectedEventTypes.includes(type)}
                      onCheckedChange={(checked) => 
                        handleEventTypeChange(type, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`event-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos de usuarios */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tipos de Usuarios</h4>
              <div className="space-y-1">
                {userTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${type}`}
                      checked={selectedUserTypes.includes(type)}
                      onCheckedChange={(checked) => 
                        handleUserTypeChange(type, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`user-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Páginas */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Páginas</h4>
              <div className="space-y-1">
                {pages.map((page) => (
                  <div key={page} className="flex items-center space-x-2">
                    <Checkbox
                      id={`page-${page}`}
                      checked={selectedPages.includes(page)}
                      onCheckedChange={(checked) => 
                        handlePageChange(page, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`page-${page}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {page}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos de errores */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tipos de Errores</h4>
              <div className="space-y-1">
                {errorTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`error-${type}`}
                      checked={selectedErrorTypes.includes(type)}
                      onCheckedChange={(checked) => 
                        handleErrorTypeChange(type, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`error-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
