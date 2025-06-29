
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CreateReservationData } from '@/hooks/rooms/useRoomReservations'
import type { OfficeRoom } from '@/hooks/useOfficeRooms'

interface RoomReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateReservationData) => void
  room?: OfficeRoom | null
}

export const RoomReservationDialog: React.FC<RoomReservationDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  room
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<{
    date: string
    start_time: string
    end_time: string
    title: string
    purpose: string
    setup_requirements: string
    attendees_count: number
  }>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '',
      end_time: '',
      title: '',
      purpose: '',
      setup_requirements: '',
      attendees_count: 1
    }
  })

  const handleFormSubmit = (data: any) => {
    const startDateTime = `${data.date}T${data.start_time}:00.000Z`
    const endDateTime = `${data.date}T${data.end_time}:00.000Z`

    const reservationData: CreateReservationData = {
      room_id: room?.id || '',
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      title: data.title,
      purpose: data.purpose,
      setup_requirements: data.setup_requirements || undefined,
      attendees_count: data.attendees_count
    }

    onSubmit(reservationData)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reservar Sala</DialogTitle>
          <DialogDescription>
            {room ? `Reserva la sala "${room.name}"` : 'Reserva una sala'}
          </DialogDescription>
        </DialogHeader>

        {room && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <h4 className="font-medium">{room.name}</h4>
            <p className="text-sm text-gray-600">
              Capacidad: {room.capacity} personas
              {room.location && ` • ${room.location}`}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: 'La fecha es requerida' })}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Hora inicio *</Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time', { required: 'La hora de inicio es requerida' })}
              />
              {errors.start_time && (
                <p className="text-sm text-red-600">{errors.start_time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">Hora fin *</Label>
              <Input
                id="end_time"
                type="time"
                {...register('end_time', { required: 'La hora de fin es requerida' })}
              />
              {errors.end_time && (
                <p className="text-sm text-red-600">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título de la reunión *</Label>
            <Input
              id="title"
              {...register('title', { required: 'El título es requerido' })}
              placeholder="Ej: Reunión de equipo semanal"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Propósito de la reunión</Label>
            <Input
              id="purpose"
              {...register('purpose')}
              placeholder="Ej: Revisión de proyecto, Presentación cliente..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees_count">Número de asistentes</Label>
            <Input
              id="attendees_count"
              type="number"
              min="1"
              max={room?.capacity || 50}
              {...register('attendees_count')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup_requirements">Requerimientos especiales</Label>
            <Textarea
              id="setup_requirements"
              {...register('setup_requirements')}
              placeholder="Configuración de mesas, equipo AV, catering..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
      </DialogContent>
    </Dialog>
  )
}
