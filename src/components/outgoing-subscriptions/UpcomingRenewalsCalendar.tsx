import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight, Filter, SortDesc } from 'lucide-react'
import { useOutgoingSubscriptions } from '@/hooks/useOutgoingSubscriptions'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isAfter, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

type ViewMode = 'calendar' | 'table'
type FilterMode = 'all' | '7days' | '15days' | '30days'

export const UpcomingRenewalsCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [filterMode, setFilterMode] = useState<FilterMode>('30days')
  
  const { subscriptions } = useOutgoingSubscriptions()

  // Filtrar suscripciones con renovaciones próximas
  const getFilteredSubscriptions = () => {
    const today = new Date()
    let endDate = new Date()
    
    switch (filterMode) {
      case '7days':
        endDate = addDays(today, 7)
        break
      case '15days':
        endDate = addDays(today, 15)
        break
      case '30days':
        endDate = addDays(today, 30)
        break
      default:
        endDate = addDays(today, 365) // Un año
    }

    return subscriptions
      .filter(sub => 
        sub.status === 'ACTIVE' && 
        sub.next_renewal_date &&
        isAfter(parseISO(sub.next_renewal_date), today) &&
        !isAfter(parseISO(sub.next_renewal_date), endDate)
      )
      .sort((a, b) => 
        new Date(a.next_renewal_date!).getTime() - new Date(b.next_renewal_date!).getTime()
      )
  }

  const filteredSubscriptions = getFilteredSubscriptions()

  // Obtener suscripciones por día (para vista calendario)
  const getSubscriptionsForDay = (date: Date) => {
    return filteredSubscriptions.filter(sub => 
      sub.next_renewal_date && isSameDay(parseISO(sub.next_renewal_date), date)
    )
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const getDaysUntilRenewal = (renewalDate: string) => {
    const today = new Date()
    const renewal = parseISO(renewalDate)
    return Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getUrgencyVariant = (days: number) => {
    if (days <= 1) return 'destructive'
    if (days <= 3) return 'secondary'
    if (days <= 7) return 'outline'
    return 'secondary'
  }

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return (
      <div className="space-y-4">
        {/* Navegación del calendario */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="border-0.5 rounded-[10px]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="border-0.5 rounded-[10px]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-2">
          {/* Headers de días */}
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Días del mes */}
          {days.map((day) => {
            const daySubscriptions = getSubscriptionsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  p-2 min-h-[80px] border-0.5 rounded-[10px] bg-white
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${daySubscriptions.length > 0 ? 'bg-orange-50 border-orange-200' : 'border-gray-200'}
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {daySubscriptions.slice(0, 2).map((sub) => (
                    <div
                      key={sub.id}
                      className="text-xs p-1 bg-white rounded border-0.5 border-orange-300"
                    >
                      <div className="font-medium truncate">{sub.provider_name}</div>
                      <div className="text-gray-600">
                        {formatCurrency(sub.amount)}
                      </div>
                    </div>
                  ))}
                  {daySubscriptions.length > 2 && (
                    <div className="text-xs text-gray-600 text-center">
                      +{daySubscriptions.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTableView = () => {
    if (filteredSubscriptions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No hay renovaciones próximas en el período seleccionado</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {filteredSubscriptions.map((subscription) => {
          const daysUntil = getDaysUntilRenewal(subscription.next_renewal_date!)
          
          return (
            <div
              key={subscription.id}
              className="flex items-center justify-between p-4 bg-white border-0.5 border-gray-200 rounded-[10px] hover:shadow-sm transition-all duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium">{subscription.provider_name}</h4>
                  <Badge 
                    variant={getUrgencyVariant(daysUntil)}
                    className="border-0.5 rounded-[10px]"
                  >
                    {daysUntil <= 0 ? 'Vencido' : `${daysUntil} días`}
                  </Badge>
                  <Badge variant="outline" className="border-0.5 rounded-[10px]">
                    {subscription.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    <strong>Renovación:</strong> {format(parseISO(subscription.next_renewal_date!), 'dd/MM/yyyy')}
                  </span>
                  <span>
                    <strong>Importe:</strong> {formatCurrency(subscription.amount, subscription.currency)}
                  </span>
                  <span>
                    <strong>Ciclo:</strong> {subscription.billing_cycle.toLowerCase()}
                  </span>
                </div>
                {subscription.description && (
                  <p className="text-sm text-gray-500 mt-1">{subscription.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-0.5 rounded-[10px]">
                  Gestionar
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Renovaciones
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Filtro de tiempo */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-[10px]">
              <Button
                variant={filterMode === '7days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('7days')}
                className="rounded-[8px] text-xs"
              >
                7d
              </Button>
              <Button
                variant={filterMode === '15days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('15days')}
                className="rounded-[8px] text-xs"
              >
                15d
              </Button>
              <Button
                variant={filterMode === '30days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('30days')}
                className="rounded-[8px] text-xs"
              >
                30d
              </Button>
            </div>
            
            {/* Toggle vista */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-[10px]">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-[8px]"
              >
                <SortDesc className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="rounded-[8px]"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Resumen */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            <strong>{filteredSubscriptions.length}</strong> renovaciones próximas
          </span>
          <span>
            <strong>
              {formatCurrency(
                filteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0)
              )}
            </strong> total a renovar
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'calendar' ? renderCalendarView() : renderTableView()}
      </CardContent>
    </Card>
  )
}