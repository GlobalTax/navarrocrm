
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Clock, Users, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import type { OfficeRoom } from '@/hooks/useOfficeRooms'

const reservationSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  purpose: z.string().optional(),
  start_datetime: z.date(),
  end_datetime: z.date(),
  attendees_count: z.number().min(1, 'Debe haber al menos 1 asistente').optional(),
  attendees_emails: z.array(z.string().email()).optional(),
  setup_requirements: z.string().optional(),
  catering_requested: z.boolean().optional()
}).refine((data) => {
  return data.end_datetime > data.start_datetime
}, {
  message: 'La fecha de fin debe ser posterior a la de inicio',
  path: ['end_datetime']
})

type ReservationFormData = z.infer<typeof reservationSchema>

interface RoomReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ReservationFormData) => void
  room: OfficeRoom | null
  preselectedDate?: Date | null
}

export const RoomReservationDialog: React.FC<RoomReservationDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  room,
  preselectedDate
}) => {
  const [attendeesEmails, setAttendeesEmails] = useState<string[]>([''])

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      title: '',
      purpose: '',
      attendees_count: 1,
      setup_requirements: '',
      catering_requested: false
    }
  })

  // Efecto para preseleccionar fecha cuando se proporciona
  useEffect(() => {
    if (preselectedDate && open) {
      const startDate = new Date(preselectedDate)
      startDate.setHours(9, 0, 0, 0) // 9:00 AM por defecto
      
      const endDate = new Date(startDate)
      endDate.setHours(10, 0, 0, 0) // 10:00 AM por defecto
      
      form.setValue('start_datetime', startDate)
      form.setValue('end_datetime', endDate)
    }
  }, [preselectedDate, open, form])

  const handleSubmit = (data: ReservationFormData) => {
    const filteredEmails = attendeesEmails.filter(email => email.trim() !== '')
    onSubmit({
      ...data,
      attendees_emails: filteredEmails.length > 0 ? filteredEmails : undefined
    })
    form.reset()
    setAttendeesEmails([''])
  }

  const addEmailField = () => {
    setAttendeesEmails([...attendeesEmails, ''])
  }

  const removeEmailField = (index: number) => {
    const newEmails = attendeesEmails.filter((_, i) => i !== index)
    setAttendeesEmails(newEmails)
  }

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...attendeesEmails]
    newEmails[index] = value
    setAttendeesEmails(newEmails)
  }

  // Generar opciones de hora
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeValue)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const formatTimeForSelect = (date: Date | undefined) => {
    if (!date) return ''
    return format(date, 'HH:mm')
  }

  const setTimeFromSelect = (date: Date | undefined, timeString: string, field: any) => {
    if (!date || !timeString) return
    
    const [hours, minutes] = timeString.split(':').map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)
    field.onChange(newDate)
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Reservar {room.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título de la reunión</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Reunión de equipo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendees_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de asistentes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max={room.capacity}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fecha y hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_datetime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha y hora de inicio</FormLabel>
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Select
                        value={formatTimeForSelect(field.value)}
                        onValueChange={(time) => setTimeFromSelect(field.value, time, field)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_datetime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha y hora de fin</FormLabel>
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Select
                        value={formatTimeForSelect(field.value)}
                        onValueChange={(time) => setTimeFromSelect(field.value, time, field)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Propósito */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propósito de la reunión</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe brevemente el propósito de la reunión..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Emails de asistentes */}
            <div className="space-y-3">
              <FormLabel>Emails de asistentes (opcional)</FormLabel>
              {attendeesEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                  />
                  {attendeesEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeEmailField(index)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEmailField}
                className="w-full"
              >
                Agregar otro email
              </Button>
            </div>

            {/* Configuración adicional */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="setup_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requisitos de configuración</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Proyector, videoconferencia, pizarra..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="catering_requested"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Solicitar catering</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        ¿Necesitas servicio de catering para esta reunión?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Reservar Sala
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
