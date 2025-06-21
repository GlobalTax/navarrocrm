
import { useState } from 'react'
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

// Datos de ejemplo - en producción vendrán de Supabase
const mockCalendarData = [
  {
    day: new Date("2025-01-02"),
    events: [
      {
        id: 1,
        name: "Reunión Cliente García",
        time: "10:00",
        datetime: "2025-01-02T10:00",
        type: 'meeting' as const,
        client: "García S.L."
      },
      {
        id: 2,
        name: "Revisión Contratos",
        time: "14:00",
        datetime: "2025-01-02T14:00",
        type: 'task' as const
      },
    ],
  },
  {
    day: new Date("2025-01-07"),
    events: [
      {
        id: 3,
        name: "Vista Oral Juzgado #3",
        time: "11:00",
        datetime: "2025-01-07T11:00",
        type: 'court' as const,
        client: "López & Asociados"
      },
      {
        id: 4,
        name: "Plazo Presentación",
        time: "17:00",
        datetime: "2025-01-07T17:00",
        type: 'deadline' as const
      },
    ],
  },
  {
    day: new Date("2025-01-10"),
    events: [
      {
        id: 5,
        name: "Consulta Martín",
        time: "09:30",
        datetime: "2025-01-10T09:30",
        type: 'meeting' as const,
        client: "Martín Rodríguez"
      },
    ],
  },
  {
    day: new Date("2025-01-15"),
    events: [
      {
        id: 6,
        name: "Entrega Documentos",
        time: "16:00",
        datetime: "2025-01-15T16:00",
        type: 'deadline' as const,
        client: "Inmobiliaria Sol"
      },
      {
        id: 7,
        name: "Reunión Equipo",
        time: "12:00",
        datetime: "2025-01-15T12:00",
        type: 'meeting' as const
      },
    ],
  },
]

export default function Calendar() {
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'meeting',
    client: ''
  })

  const handleNewEvent = () => {
    setIsNewEventOpen(true)
  }

  const handleEventClick = (event: any) => {
    console.log('Clicked event:', event)
    // TODO: Abrir modal de detalles del evento
  }

  const handleSaveEvent = () => {
    console.log('Saving event:', newEvent)
    // TODO: Guardar evento en Supabase
    setIsNewEventOpen(false)
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'meeting',
      client: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <FullScreenCalendar 
            data={mockCalendarData}
            onNewEvent={handleNewEvent}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Dialog para nuevo evento */}
        <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo Evento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="deadline">Plazo</SelectItem>
                    <SelectItem value="task">Tarea</SelectItem>
                    <SelectItem value="court">Juzgado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="client">Cliente (opcional)</Label>
                <Input
                  id="client"
                  value={newEvent.client}
                  onChange={(e) => setNewEvent({...newEvent, client: e.target.value})}
                  placeholder="Nombre del cliente"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsNewEventOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Evento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
