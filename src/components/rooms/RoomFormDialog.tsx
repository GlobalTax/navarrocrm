
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import type { CreateRoomData, OfficeRoom } from '@/hooks/useOfficeRooms'

interface RoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateRoomData) => void
  room?: OfficeRoom | null
  title?: string
}

export const RoomFormDialog: React.FC<RoomFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  room,
  title = 'Nueva Sala'
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateRoomData>({
    defaultValues: {
      name: room?.name || '',
      description: room?.description || '',
      room_type: room?.room_type || 'meeting_room',
      capacity: room?.capacity || 1,
      location: room?.location || '',
      floor: room?.floor || '',
      hourly_rate: room?.hourly_rate || 0,
      is_bookable: room?.is_bookable ?? true,
      equipment_available: room?.equipment_available || [],
    }
  })

  React.useEffect(() => {
    if (room) {
      setValue('name', room.name)
      setValue('description', room.description || '')
      setValue('room_type', room.room_type)
      setValue('capacity', room.capacity)
      setValue('location', room.location || '')
      setValue('floor', room.floor || '')
      setValue('hourly_rate', room.hourly_rate || 0)
      setValue('is_bookable', room.is_bookable)
      setValue('equipment_available', room.equipment_available || [])
    }
  }, [room, setValue])

  const handleFormSubmit = (data: CreateRoomData) => {
    onSubmit(data)
    reset()
    onOpenChange(false)
  }

  const roomTypes = [
    { value: 'meeting_room', label: 'Sala de Reuniones' },
    { value: 'conference_room', label: 'Sala de Conferencias' },
    { value: 'training_room', label: 'Sala de Formación' },
    { value: 'office', label: 'Oficina' },
    { value: 'coworking', label: 'Coworking' },
    { value: 'phone_booth', label: 'Cabina Telefónica' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {room ? 'Edita los detalles de la sala' : 'Crea una nueva sala para la oficina'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la sala *</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              placeholder="Ej: Sala de Reuniones A"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe las características de la sala..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_type">Tipo de sala</Label>
              <Select
                value={watch('room_type')}
                onValueChange={(value) => setValue('room_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                {...register('capacity', { 
                  required: 'La capacidad es requerida',
                  min: { value: 1, message: 'Mínimo 1 persona' }
                })}
                placeholder="Ej: 8"
              />
              {errors.capacity && (
                <p className="text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ej: Planta Baja"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Planta</Label>
              <Input
                id="floor"
                {...register('floor')}
                placeholder="Ej: 1º"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Tarifa por hora (€)</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              min="0"
              {...register('hourly_rate')}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_bookable"
              checked={watch('is_bookable')}
              onCheckedChange={(checked) => setValue('is_bookable', checked)}
            />
            <Label htmlFor="is_bookable">Permitir reservas</Label>
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
              {room ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
