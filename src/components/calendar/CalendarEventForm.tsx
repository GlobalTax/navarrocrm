
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2, Clock, Users, AlertCircle, Mail, Calendar } from 'lucide-react'
import { CreateCalendarEventData } from '@/hooks/useCalendarEvents'
import { EmailInvitationPreview } from '@/components/integrations/EmailInvitationPreview'
import { OutlookSyncStatus } from '@/components/integrations/OutlookSyncStatus'
import { AttendeeManager } from '@/components/integrations/AttendeeManager'

interface CalendarEventFormProps {
  formData: CreateCalendarEventData & { 
    date: string
    time: string
    end_date: string
    end_time: string
    attendees: string[]
    matter: string
    reminders: number[]
    repeat: boolean
    sync_with_outlook?: boolean
    auto_send_invitations?: boolean
    attendees_emails?: string[]
  }
  setFormData: (data: any) => void
  onSubmit: () => void
  isCreating: boolean
  clients: any[]
  cases: any[]
}

export function CalendarEventForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isCreating, 
  clients,
  cases 
}: CalendarEventFormProps) {
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('')

  const addReminder = () => {
    setFormData((prev: any) => ({
      ...prev,
      reminders: [...prev.reminders, 15]
    }))
  }

  const updateReminder = (index: number, value: number) => {
    setFormData((prev: any) => ({
      ...prev,
      reminders: prev.reminders.map((r: number, i: number) => i === index ? value : r)
    }))
  }

  const removeReminder = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      reminders: prev.reminders.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleAttendeesChange = (newAttendees: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      attendees_emails: newAttendees
    }))
  }

  const handleInvitationToggle = (enabled: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      auto_send_invitations: enabled
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
      {/* Columna principal - Detalles del evento */}
      <div className="lg:col-span-2 space-y-6">
        {/* Detalles básicos del evento */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Detalles del evento</h3>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Título del evento"
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time" className="text-sm font-medium">
                  Hora de inicio <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="flex-1"
                  />
                  {!formData.is_all_day && (
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
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
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="flex-1"
                  />
                  {!formData.is_all_day && (
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
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
                  checked={formData.is_all_day}
                  onCheckedChange={(checked) => setFormData({...formData, is_all_day: checked as boolean})}
                />
                <Label htmlFor="all-day" className="text-sm">Todo el día</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sync-outlook"
                  checked={formData.sync_with_outlook || false}
                  onCheckedChange={(checked) => setFormData({...formData, sync_with_outlook: checked as boolean})}
                />
                <Label htmlFor="sync-outlook" className="text-sm">Sincronizar con Outlook</Label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-sm font-medium">Ubicación</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
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
              <Select value={formData.contact_id || 'none'} onValueChange={(value) => setFormData({...formData, contact_id: value === 'none' ? null : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente</SelectItem>
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
              <Select value={formData.case_id || 'none'} onValueChange={(value) => setFormData({...formData, case_id: value === 'none' ? null : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar expediente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin expediente</SelectItem>
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

        {/* Tipo de evento */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tipo de evento</h3>
          <Select value={formData.event_type} onValueChange={(value: any) => setFormData({...formData, event_type: value})}>
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
            value={formData.description || ''}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Descripción del evento"
            rows={4}
          />
        </div>

        {/* Recordatorios */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium">Recordatorios</h3>
          </div>
          
          <div className="space-y-3">
            {formData.reminders.map((reminder, index) => (
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
                {formData.reminders.length > 1 && (
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
      </div>

      {/* Columna lateral - Integraciones y participantes */}
      <div className="space-y-6">
        {/* Estado de Outlook */}
        {formData.sync_with_outlook && (
          <OutlookSyncStatus
            syncEnabled={formData.sync_with_outlook}
            emailEnabled={formData.auto_send_invitations || false}
            connectionStatus="connected"
          />
        )}

        {/* Gestión de participantes */}
        <AttendeeManager
          attendees={formData.attendees_emails || []}
          onAttendeesChange={handleAttendeesChange}
          disabled={isCreating}
        />

        {/* Preview de invitaciones */}
        {formData.sync_with_outlook && (
          <EmailInvitationPreview
            eventTitle={formData.title}
            eventDate={formData.date}
            eventTime={formData.time}
            eventLocation={formData.location}
            eventDescription={formData.description}
            attendees={formData.attendees_emails || []}
            isEnabled={formData.auto_send_invitations || false}
            onToggle={handleInvitationToggle}
          />
        )}
      </div>
    </div>
  )
}
