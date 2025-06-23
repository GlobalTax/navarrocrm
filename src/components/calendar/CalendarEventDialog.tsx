
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { CalendarEventForm } from './CalendarEventForm'
import { CreateCalendarEventData } from '@/hooks/useCalendarEvents'

interface CalendarEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCalendarEventData) => void
  isCreating: boolean
  clients: any[]
  cases: any[]
  selectedDate?: Date | null
}

export function CalendarEventDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isCreating, 
  clients, 
  cases, 
  selectedDate 
}: CalendarEventDialogProps) {
  // Safely handle selectedDate to ensure it's a valid Date object
  const getDefaultDate = () => {
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      return selectedDate.toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState<CreateCalendarEventData & { 
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
    date: getDefaultDate(),
    time: '',
    end_date: getDefaultDate(),
    end_time: '',
    event_type: 'meeting',
    location: '',
    is_all_day: false,
    reminder_minutes: 15,
    contact_id: null,
    case_id: null,
    start_datetime: '',
    end_datetime: '',
    attendees: [],
    matter: '',
    reminders: [15],
    repeat: false
  })

  const handleSubmit = () => {
    if (!formData.title || !formData.date) {
      return
    }

    // Safely construct dates with validation
    let startDateTime: string
    let endDateTime: string

    try {
      if (formData.is_all_day) {
        // For all-day events, use noon to avoid timezone issues
        startDateTime = `${formData.date}T12:00:00.000Z`
        endDateTime = formData.end_date 
          ? `${formData.end_date}T12:00:00.000Z`
          : `${formData.date}T12:00:00.000Z`
      } else {
        // For timed events, require time
        if (!formData.time) {
          console.error('Time is required for non-all-day events')
          return
        }
        
        startDateTime = `${formData.date}T${formData.time}:00.000Z`
        endDateTime = formData.end_date && formData.end_time 
          ? `${formData.end_date}T${formData.end_time}:00.000Z`
          : `${formData.date}T${formData.time}:00.000Z`
      }

      // Validate the constructed dates
      const startDate = new Date(startDateTime)
      const endDate = new Date(endDateTime)
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Invalid date/time values provided')
        return
      }

      const eventData: CreateCalendarEventData = {
        title: formData.title,
        description: formData.description || null,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        event_type: formData.event_type,
        location: formData.location || null,
        is_all_day: formData.is_all_day,
        reminder_minutes: formData.reminders[0] || null,
        contact_id: formData.contact_id || null,
        case_id: formData.case_id || null,
        status: 'scheduled'
      }

      onSubmit(eventData)
    } catch (error) {
      console.error('Error creating event data:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: getDefaultDate(),
      time: '',
      end_date: getDefaultDate(),
      end_time: '',
      event_type: 'meeting',
      location: '',
      is_all_day: false,
      reminder_minutes: 15,
      contact_id: null,
      case_id: null,
      start_datetime: '',
      end_datetime: '',
      attendees: [],
      matter: '',
      reminders: [15],
      repeat: false
    })
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Nuevo Evento</DialogTitle>
        </DialogHeader>
        
        <CalendarEventForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isCreating={isCreating}
          clients={clients}
          cases={cases}
        />
        
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
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
  )
}
