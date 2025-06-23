import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, AlertTriangle, Plus, CalendarDays, Loader2 } from 'lucide-react'
import { format, isToday, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { useMemo } from 'react'

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'meeting': 
    case 'consultation': 
      return <Calendar className="h-4 w-4" />
    case 'deadline': return <AlertTriangle className="h-4 w-4" />
    case 'task': return <Clock className="h-4 w-4" />
    case 'court': return <AlertTriangle className="h-4 w-4" />
    default: return <Calendar className="h-4 w-4" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'meeting': 
    case 'consultation': 
      return 'bg-blue-100 text-blue-800'
    case 'deadline': return 'bg-red-100 text-red-800'
    case 'task': return 'bg-green-100 text-green-800'
    case 'court': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'meeting': return 'Reunión'
    case 'consultation': return 'Consulta'
    case 'deadline': return 'Plazo'
    case 'task': return 'Tarea'
    case 'court': return 'Juzgado'
    default: return 'Evento'
  }
}

const getPriorityColor = (type: string) => {
  switch (type) {
    case 'deadline':
    case 'court': 
      return 'border-l-red-500'
    case 'meeting':
    case 'consultation': 
      return 'border-l-blue-500'
    case 'task': 
      return 'border-l-green-500'
    default: 
      return 'border-l-gray-500'
  }
}

export const TodayAgenda = () => {
  const today = new Date()
  const navigate = useNavigate()
  const { events, isLoading } = useCalendarEvents()

  // Filtrar eventos de hoy
  const todayEvents = useMemo(() => {
    if (!events) return []
    
    return events
      .filter(event => {
        const eventDate = new Date(event.start_datetime)
        return isToday(eventDate)
      })
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
      .slice(0, 5) // Mostrar máximo 5 eventos
  }, [events])
  
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            Agenda de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando agenda...</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Agenda de Hoy
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {format(today, 'EEEE, d MMMM', { locale: es })}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0"
            onClick={() => navigate('/calendar')}
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0"
            onClick={() => navigate('/calendar')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay eventos programados para hoy</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate('/calendar')}
            >
              Ver Calendario Completo
            </Button>
          </div>
        ) : (
          <>
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-3 rounded-lg border-l-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${getPriorityColor(event.event_type)}`}
                onClick={() => navigate('/calendar')}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {getTypeIcon(event.event_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <Badge variant="secondary" className={`text-xs ${getTypeColor(event.event_type)}`}>
                        {getTypeLabel(event.event_type)}
                      </Badge>
                    </div>
                    {event.contact && (
                      <p className="text-xs text-muted-foreground">{event.contact.name}</p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground">📍 {event.location}</p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {event.is_all_day ? 'Todo el día' : format(new Date(event.start_datetime), 'HH:mm')}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => navigate('/calendar')}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Ver Calendario Completo
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
