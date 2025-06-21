
import { useState, useMemo } from 'react'
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2, Clock, Users, AlertCircle } from 'lucide-react'
import { useCalendarEvents, CreateCalendarEventData } from '@/hooks/useCalendarEvents'
import { useClients } from '@/hooks/useClients'
import { useCases } from '@/hooks/useCases'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Calendar() {
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const { events, isLoading, createEvent, isCreating } = useCalendarEvents()
  const { clients = [] } = useClients()
  const { cases = [] } = useCases()
  
  const [newEvent, setNewEvent] = useState<CreateCalendarEventData & { 
    date: string
    time: string
    end_date: string
    end_time: string
    attendees: string[]
    matter: string
    reminders: number[]
    repeat: boolean
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
    end_datetime: '',
    attendees: [],
    matter: '',
    reminders: [15],
    repeat: false
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
      reminder_minutes: newEvent.reminders[0] || null,
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
          end_datetime: '',
          attendees: [],
          matter: '',
          reminders: [15],
          repeat: false
        })
      }
    })
  }

  const addReminder = () => {
    setNewEvent(prev => ({
      ...prev,
      reminders: [...prev.reminders, 15]
    }))
  }

  const updateReminder = (index: number, value: number) => {
    setNewEvent(prev => ({
      ...prev,
      reminders: prev.reminders.map((r, i) => i === index ? value : r)
    }))
  }

  const removeReminder = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }))
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

        {/* Dialog para nuevo evento mejorado */}
        <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Nuevo Evento</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
              {/* Columna principal - Detalles del evento */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Detalles del evento</h3>
                  
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Título <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="Título del evento"
                        className="text-base"
                      />
                      <p className="text-sm text-gray-500">Este campo es obligatorio.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-time" className="text-sm font-medium">
                          Hora de inicio <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                            className="flex-1"
                          />
                          {!newEvent.is_all_day && (
                            <Input
                              type="time"
                              value={newEvent.time}
                              onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                              className="w-32"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="end-time" className="text-sm font-medium">
                          Hora de fin <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={newEvent.end_date}
                            onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                            className="flex-1"
                          />
                          {!newEvent.is_all_day && (
                            <Input
                              type="time"
                              value={newEvent.end_time}
                              onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                              className="w-32"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="all-day"
                          checked={newEvent.is_all_day}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, is_all_day: checked as boolean})}
                        />
                        <Label htmlFor="all-day" className="text-sm">Todo el día</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="repeat"
                          checked={newEvent.repeat}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, repeat: checked as boolean})}
                        />
                        <Label htmlFor="repeat" className="text-sm">Repetir</Label>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="location" className="text-sm font-medium">Ubicación</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                        placeholder="Ubicación del evento"
                      />
                    </div>
                  </div>
                </div>

                {/* Asunto/Expediente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Asunto</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="client" className="text-sm font-medium">Cliente</Label>
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
                      <Label htmlFor="case" className="text-sm font-medium">Expediente</Label>
                      <Select value={newEvent.case_id || ''} onValueChange={(value) => setNewEvent({...newEvent, case_id: value || null})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar expediente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin expediente</SelectItem>
                          {cases.map((case_item) => (
                            <SelectItem key={case_item.id} value={case_item.id}>
                              {case_item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Recordatorios */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium">Recordatorios</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {newEvent.reminders.map((reminder, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <Select 
                          value={reminder.toString()} 
                          onValueChange={(value) => updateReminder(index, parseInt(value))}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 minutos antes</SelectItem>
                            <SelectItem value="15">15 minutos antes</SelectItem>
                            <SelectItem value="30">30 minutos antes</SelectItem>
                            <SelectItem value="60">1 hora antes</SelectItem>
                            <SelectItem value="1440">1 día antes</SelectItem>
                          </SelectContent>
                        </Select>
                        {newEvent.reminders.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeReminder(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={addReminder}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      + Añadir nuevo recordatorio
                    </Button>
                  </div>
                </div>

                {/* Tipo de evento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tipo de evento</h3>
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

                {/* Descripción */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Descripción</h3>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Descripción del evento"
                    rows={4}
                  />
                </div>
              </div>

              {/* Columna lateral - Invitar participantes */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium">Invitar participantes</h3>
                  </div>
                  
                  <div className="grid gap-3">
                    <Input
                      placeholder="Buscar usuarios o contactos"
                      className="text-sm"
                    />
                    <p className="text-sm text-gray-500">
                      Busca usuarios de la firma o contactos para invitar
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Participantes sugeridos</h4>
                    <p className="text-sm text-gray-500">No hay sugerencias en este momento.</p>
                  </div>
                </div>

                {/* Guardar en calendario */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Guardar en calendario</h3>
                  <Select defaultValue="personal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Mi calendario</SelectItem>
                      <SelectItem value="firm">Calendario de la firma</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="add-to-firm" />
                    <Label htmlFor="add-to-firm" className="text-sm">
                      Añadir también al calendario de la firma
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t">
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
