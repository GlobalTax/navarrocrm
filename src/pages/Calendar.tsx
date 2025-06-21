
import { useState, useMemo } from 'react'
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog'
import { Loader2 } from 'lucide-react'
import { useCalendarEvents, CreateCalendarEventData } from '@/hooks/useCalendarEvents'
import { useClients } from '@/hooks/useClients'
import { useCases } from '@/hooks/useCases'
import { format } from 'date-fns'

export default function Calendar() {
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const { events, isLoading, createEvent, isCreating } = useCalendarEvents()
  const { clients = [] } = useClients()
  const { cases = [] } = useCases()

  // Transformar eventos para el componente FullScreenCalendar
  const calendarData = useMemo(() => {
    if (!events.length) return []

    const eventsByDate = events.reduce((acc, event) => {
      const eventDate = new Date(event.start_datetime)
      const dateKey = format(eventDate, 'yyyy-MM-dd')
      
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      
      acc[dateKey].push({
        id: event.id,
        name: event.title,
        time: format(eventDate, 'HH:mm'),
        datetime: event.start_datetime,
        type: event.event_type as 'meeting' | 'deadline' | 'task' | 'court',
        client: event.client?.name,
        description: event.description,
        location: event.location,
        status: event.status
      })
      
      return acc
    }, {} as Record<string, any[]>)

    return Object.entries(eventsByDate).map(([date, events]) => ({
      day: new Date(date),
      events
    }))
  }, [events])

  const handleNewEvent = (date?: Date) => {
    // Validate and safely set the selected date
    if (date && date instanceof Date && !isNaN(date.getTime())) {
      setSelectedDate(date)
    } else {
      setSelectedDate(new Date()) // fallback to current date
    }
    setIsNewEventOpen(true)
  }

  const handleEventClick = (event: any) => {
    console.log('Clicked event:', event)
    // TODO: Abrir modal de detalles/edición del evento
  }

  const handleCreateEvent = (eventData: CreateCalendarEventData) => {
    createEvent(eventData, {
      onSuccess: () => {
        setIsNewEventOpen(false)
        setSelectedDate(null)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando calendario...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <FullScreenCalendar 
            data={calendarData}
            onNewEvent={handleNewEvent}
            onEventClick={handleEventClick}
          />
        </div>

        <CalendarEventDialog
          open={isNewEventOpen}
          onOpenChange={setIsNewEventOpen}
          onSubmit={handleCreateEvent}
          isCreating={isCreating}
          clients={clients}
          cases={cases}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  )
}
