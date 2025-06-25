
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { X, Filter, Download, RefreshCw } from 'lucide-react'
import { DateRange } from 'react-day-picker'

interface AnalyticsFiltersProps {
  timeRange: string
  onTimeRangeChange: (range: string) => void
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
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
  onExport?: () => void
  onRefresh?: () => void
  isLoading?: boolean
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
  isLoading = false
}) => {
  const handleEventTypeToggle = (eventType: string) => {
    if (selectedEventTypes.includes(eventType)) {
      onEventTypesChange(selectedEventTypes.filter(t => t !== eventType))
    } else {
      onEventTypesChange([...selectedEventTypes, eventType])
    }
  }

  const handleUserTypeToggle = (userType: string) => {
    if (selectedUserTypes.includes(userType)) {
      onUserTypesChange(selectedUserTypes.filter(t => t !== userType))
    } else {
      onUserTypesChange([...selectedUserTypes, userType])
    }
  }

  const handlePageToggle = (page: string) => {
    if (selectedPages.includes(page)) {
      onPagesChange(selectedPages.filter(p => p !== page))
    } else {
      onPagesChange([...selectedPages, page])
    }
  }

  const handleErrorTypeToggle = (errorType: string) => {
    if (selectedErrorTypes.includes(errorType)) {
      onErrorTypesChange(selectedErrorTypes.filter(t => t !== errorType))
    } else {
      onErrorTypesChange([...selectedErrorTypes, errorType])
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedEventTypes.length > 0 && selectedEventTypes.length < eventTypes.length) count++
    if (selectedUserTypes.length > 0 && selectedUserTypes.length < userTypes.length) count++
    if (selectedPages.length > 0 && selectedPages.length < pages.length) count++
    if (selectedErrorTypes.length > 0 && selectedErrorTypes.length < errorTypes.length) count++
    if (dateRange?.from || dateRange?.to) count++
    return count
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filtros Avanzados</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} activos
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Rango de Tiempo</Label>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {timeRange === 'custom' && onDateRangeChange && (
            <div className="space-y-2">
              <Label>Fechas Personalizadas</Label>
              <DateRangePicker
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
              />
            </div>
          )}
        </div>

        {/* Event Types */}
        <div className="space-y-2">
          <Label>Tipos de Evento</Label>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map(eventType => (
              <Badge
                key={eventType}
                variant={selectedEventTypes.includes(eventType) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleEventTypeToggle(eventType)}
              >
                {eventType}
                {selectedEventTypes.includes(eventType) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* User Types */}
        <div className="space-y-2">
          <Label>Tipos de Usuario</Label>
          <div className="flex flex-wrap gap-2">
            {userTypes.map(userType => (
              <Badge
                key={userType}
                variant={selectedUserTypes.includes(userType) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleUserTypeToggle(userType)}
              >
                {userType}
                {selectedUserTypes.includes(userType) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Pages */}
        <div className="space-y-2">
          <Label>Páginas</Label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {pages.slice(0, 20).map(page => (
              <Badge
                key={page}
                variant={selectedPages.includes(page) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => handlePageToggle(page)}
              >
                {page.length > 30 ? `${page.substring(0, 30)}...` : page}
                {selectedPages.includes(page) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
            {pages.length > 20 && (
              <Badge variant="secondary" className="text-xs">
                +{pages.length - 20} más
              </Badge>
            )}
          </div>
        </div>

        {/* Error Types */}
        {errorTypes.length > 0 && (
          <div className="space-y-2">
            <Label>Tipos de Error</Label>
            <div className="flex flex-wrap gap-2">
              {errorTypes.map(errorType => (
                <Badge
                  key={errorType}
                  variant={selectedErrorTypes.includes(errorType) ? "destructive" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleErrorTypeToggle(errorType)}
                >
                  {errorType}
                  {selectedErrorTypes.includes(errorType) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {getActiveFiltersCount()} filtros activos aplicados
              </span>
              <Button variant="ghost" size="sm" onClick={onReset}>
                Limpiar todos
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
