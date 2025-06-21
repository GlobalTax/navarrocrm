
import { useState, useMemo } from 'react'
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2 } from 'lucide-react'
import { useCalendarEvents, CreateCalendarEventData } from '@/hooks/useCalendarEvents'
import { useClients } from '@/hooks/useClients'
import { useCases } from '@/hooks/useCases'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Calendar() {
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const { events, isLoading, createEvent, isCreating } = useCalendarEvents()
  const { data: clients = [] } = useClients()
  const { data: cases = [] } = useCases()
  
  const [newEvent, setNewEvent] = useState<CreateCalendarEventData & { 
    date: string
    time: string
    end_date: string
    end_time: string
  }>({
    title: '',
    description: '',
    date: '',
    time: '',
    end_date: '',
    end_time: '',
    event_type: 'meeting',
    location: '',
    is_all_day: false,
    reminder_minutes: 15,
    client_id: null,
    case_id: null,
    start_datetime: '',
    end_datetime: ''
  })

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
    if (date) {
      setSelectedDate(date)
      const dateStr = format(date, 'yyyy-MM-dd')
      setNewEvent(prev => ({
        ...prev,
        date: dateStr,
        end_date: dateStr
      }))
    }
    setIsNewEventOpen(true)
  }

  const handleEventClick = (event: any) => {
    console.log('Clicked event:', event)
    // TODO: Abrir modal de detalles/edición del evento
  }

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      return
    }

    // Construir las fechas completas
    const startDateTime = `${newEvent.date}T${newEvent.time}:00.000Z`
    const endDateTime = newEvent.end_date && newEvent.end_time 
      ? `${newEvent.end_date}T${newEvent.end_time}:00.000Z`
      : `${newEvent.date}T${newEvent.time}:00.000Z`

    const eventData: CreateCalendarEventData = {
      title: newEvent.title,
      description: newEvent.description || null,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      event_type: newEvent.event_type,
      location: newEvent.location || null,
      is_all_day: newEvent.is_all_day,
      reminder_minutes: newEvent.reminder_minutes,
      client_id: newEvent.client_id || null,
      case_id: newEvent.case_id || null,
      status: 'scheduled'
    }

    createEvent(eventData, {
      onSuccess: () => {
        setIsNewEventOpen(false)
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          end_date: '',
          end_time: '',
          event_type: 'meeting',
          location: '',
          is_all_day: false,
          reminder_minutes: 15,
          client_id: null,
          case_id: null,
          start_datetime: '',
          end_datetime: ''
        })
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

        {/* Dialog para nuevo evento */}
        <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Evento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Título del evento"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Descripción opcional"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="all-day"
                  checked={newEvent.is_all_day}
                  onCheckedChange={(checked) => setNewEvent({...newEvent, is_all_day: checked})}
                />
                <Label htmlFor="all-day">Evento de todo el día</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha de inicio *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                
                {!newEvent.is_all_day && (
                  <div className="grid gap-2">
                    <Label htmlFor="time">Hora de inicio *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="end-date">Fecha de fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                  />
                </div>
                
                {!newEvent.is_all_day && (
                  <div className="grid gap-2">
                    <Label htmlFor="end-time">Hora de fin</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de evento</Label>
                <Select value={newEvent.event_type} onValueChange={(value: any) => setNewEvent({...newEvent, event_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="consultation">Consulta</SelectItem>
                    <SelectItem value="deadline">Plazo Legal</SelectItem>
                    <SelectItem value="task">Tarea</SelectItem>
                    <SelectItem value="court">Audiencia/Juzgado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Ubicación del evento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select value={newEvent.client_id || ''} onValueChange={(value) => setNewEvent({...newEvent, client_id: value || null})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin cliente</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="case">Caso</Label>
                  <Select value={newEvent.case_id || ''} onValueChange={(value) => setNewEvent({...newEvent, case_id: value || null})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar caso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin caso</SelectItem>
                      {cases.map((case_item) => (
                        <SelectItem key={case_item.id} value={case_item.id}>
                          {case_item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reminder">Recordatorio (minutos antes)</Label>
                <Select 
                  value={newEvent.reminder_minutes?.toString() || ''} 
                  onValueChange={(value) => setNewEvent({...newEvent, reminder_minutes: value ? parseInt(value) : null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin recordatorio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin recordatorio</SelectItem>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="1440">1 día</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsNewEventOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEvent} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Evento
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
