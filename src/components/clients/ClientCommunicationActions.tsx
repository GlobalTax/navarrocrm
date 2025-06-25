
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Phone, Calendar, Plus } from 'lucide-react'
import { useContactNotes } from '@/hooks/useContactNotes'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { toast } from 'sonner'

interface ClientCommunicationActionsProps {
  clientId: string
  clientName: string
  clientEmail?: string
  onCommunicationCreated?: () => void
}

export const ClientCommunicationActions = ({ 
  clientId, 
  clientName, 
  clientEmail,
  onCommunicationCreated 
}: ClientCommunicationActionsProps) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [callDialogOpen, setCallDialogOpen] = useState(false)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)

  const { createNote } = useContactNotes(clientId)
  const { createEvent } = useCalendarEvents()

  // Estados para los formularios
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: ''
  })

  const [callForm, setCallForm] = useState({
    datetime: '',
    duration: '30',
    notes: ''
  })

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    datetime: '',
    duration: '60',
    location: '',
    description: ''
  })

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    note_type: 'general' as const,
    is_private: false
  })

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Aquí iría la lógica para enviar email
      // Por ahora, solo mostramos un toast
      toast.success(`Email enviado a ${clientName}`)
      setEmailDialogOpen(false)
      setEmailForm({ subject: '', content: '' })
      onCommunicationCreated?.()
    } catch (error) {
      toast.error('Error al enviar email')
    }
  }

  const handleCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const startDate = new Date(callForm.datetime)
      const endDate = new Date(startDate.getTime() + parseInt(callForm.duration) * 60000)

      await createEvent({
        title: `Llamada con ${clientName}`,
        description: callForm.notes,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        event_type: 'call',
        status: 'scheduled',
        contact_id: clientId,
        attendees_emails: clientEmail ? [clientEmail] : []
      })

      toast.success('Llamada programada correctamente')
      setCallDialogOpen(false)
      setCallForm({ datetime: '', duration: '30', notes: '' })
      onCommunicationCreated?.()
    } catch (error) {
      toast.error('Error al programar llamada')
    }
  }

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const startDate = new Date(meetingForm.datetime)
      const endDate = new Date(startDate.getTime() + parseInt(meetingForm.duration) * 60000)

      await createEvent({
        title: meetingForm.title,
        description: meetingForm.description,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        event_type: 'meeting',
        status: 'scheduled',
        contact_id: clientId,
        location: meetingForm.location,
        attendees_emails: clientEmail ? [clientEmail] : []
      })

      toast.success('Reunión programada correctamente')
      setMeetingDialogOpen(false)
      setMeetingForm({ title: '', datetime: '', duration: '60', location: '', description: '' })
      onCommunicationCreated?.()
    } catch (error) {
      toast.error('Error al programar reunión')
    }
  }

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createNote({
        contact_id: clientId,
        title: noteForm.title,
        content: noteForm.content,
        note_type: noteForm.note_type,
        is_private: noteForm.is_private
      })

      toast.success('Nota creada correctamente')
      setNoteDialogOpen(false)
      setNoteForm({ title: '', content: '', note_type: 'general', is_private: false })
      onCommunicationCreated?.()
    } catch (error) {
      toast.error('Error al crear nota')
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" className="gap-2" onClick={() => setEmailDialogOpen(true)}>
        <Mail className="h-4 w-4" />
        Enviar Email
      </Button>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setCallDialogOpen(true)}>
        <Phone className="h-4 w-4" />
        Programar Llamada
      </Button>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setMeetingDialogOpen(true)}>
        <Calendar className="h-4 w-4" />
        Agendar Reunión
      </Button>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setNoteDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        Añadir Nota
      </Button>

      {/* Dialog para enviar email */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar Email a {clientName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Asunto</Label>
              <Input
                id="email-subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Asunto del email"
                required
              />
            </div>
            <div>
              <Label htmlFor="email-content">Contenido</Label>
              <Textarea
                id="email-content"
                value={emailForm.content}
                onChange={(e) => setEmailForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Enviar Email</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para programar llamada */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Programar Llamada con {clientName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCallSubmit} className="space-y-4">
            <div>
              <Label htmlFor="call-datetime">Fecha y Hora</Label>
              <Input
                id="call-datetime"
                type="datetime-local"
                value={callForm.datetime}
                onChange={(e) => setCallForm(prev => ({ ...prev, datetime: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="call-duration">Duración (minutos)</Label>
              <Select value={callForm.duration} onValueChange={(value) => setCallForm(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="call-notes">Notas</Label>
              <Textarea
                id="call-notes"
                value={callForm.notes}
                onChange={(e) => setCallForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Agenda o notas para la llamada..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCallDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Programar Llamada</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para agendar reunión */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agendar Reunión con {clientName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMeetingSubmit} className="space-y-4">
            <div>
              <Label htmlFor="meeting-title">Título</Label>
              <Input
                id="meeting-title"
                value={meetingForm.title}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título de la reunión"
                required
              />
            </div>
            <div>
              <Label htmlFor="meeting-datetime">Fecha y Hora</Label>
              <Input
                id="meeting-datetime"
                type="datetime-local"
                value={meetingForm.datetime}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, datetime: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="meeting-duration">Duración (minutos)</Label>
              <Select value={meetingForm.duration} onValueChange={(value) => setMeetingForm(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1.5 horas</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="meeting-location">Ubicación</Label>
              <Input
                id="meeting-location"
                value={meetingForm.location}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Dirección o plataforma virtual"
              />
            </div>
            <div>
              <Label htmlFor="meeting-description">Descripción</Label>
              <Textarea
                id="meeting-description"
                value={meetingForm.description}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Agenda y objetivos de la reunión..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMeetingDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Agendar Reunión</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para añadir nota */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Añadir Nota para {clientName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNoteSubmit} className="space-y-4">
            <div>
              <Label htmlFor="note-title">Título</Label>
              <Input
                id="note-title"
                value={noteForm.title}
                onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título de la nota"
                required
              />
            </div>
            <div>
              <Label htmlFor="note-type">Tipo de Nota</Label>
              <Select value={noteForm.note_type} onValueChange={(value: any) => setNoteForm(prev => ({ ...prev, note_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="llamada">Llamada</SelectItem>
                  <SelectItem value="reunion">Reunión</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="tarea">Tarea</SelectItem>
                  <SelectItem value="recordatorio">Recordatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="note-content">Contenido</Label>
              <Textarea
                id="note-content"
                value={noteForm.content}
                onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenido de la nota..."
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="note-private"
                checked={noteForm.is_private}
                onChange={(e) => setNoteForm(prev => ({ ...prev, is_private: e.target.checked }))}
              />
              <Label htmlFor="note-private">Nota privada (solo visible para mí)</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setNoteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Nota</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
