
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useCreateOfficeRoom, useUpdateOfficeRoom } from '@/hooks/useOfficeRooms'
import { OfficeRoom } from '@/types/office'

interface OfficeRoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: OfficeRoom | null
  onSuccess: () => void
}

export const OfficeRoomFormDialog = ({ 
  open, 
  onOpenChange, 
  room, 
  onSuccess 
}: OfficeRoomFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
    room_type: 'meeting_room',
    location: '',
    floor: '',
    equipment_available: [] as string[],
    hourly_rate: 0,
    is_bookable: true,
    amenities: {}
  })
  const [newEquipment, setNewEquipment] = useState('')

  const createRoom = useCreateOfficeRoom()
  const updateRoom = useUpdateOfficeRoom()

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        description: room.description || '',
        capacity: room.capacity,
        room_type: room.room_type,
        location: room.location || '',
        floor: room.floor || '',
        equipment_available: room.equipment_available || [],
        hourly_rate: room.hourly_rate,
        is_bookable: room.is_bookable,
        amenities: room.amenities || {}
      })
    } else {
      setFormData({
        name: '',
        description: '',
        capacity: 1,
        room_type: 'meeting_room',
        location: '',
        floor: '',
        equipment_available: [],
        hourly_rate: 0,
        is_bookable: true,
        amenities: {}
      })
    }
  }, [room, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (room) {
        await updateRoom.mutateAsync({ id: room.id, ...formData })
      } else {
        await createRoom.mutateAsync(formData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving room:', error)
    }
  }

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipment_available.includes(newEquipment.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment_available: [...prev.equipment_available, newEquipment.trim()]
      }))
      setNewEquipment('')
    }
  }

  const removeEquipment = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment_available: prev.equipment_available.filter(e => e !== equipment)
    }))
  }

  const roomTypes = [
    { value: 'meeting_room', label: 'Sala de Reuniones' },
    { value: 'conference_room', label: 'Sala de Conferencias' },
    { value: 'office', label: 'Oficina' },
    { value: 'coworking', label: 'Coworking' },
    { value: 'auditorium', label: 'Auditorio' },
    { value: 'training_room', label: 'Sala de Formación' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {room ? 'Editar Sala' : 'Nueva Sala'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre de la sala *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="room_type">Tipo de sala</Label>
              <Select 
                value={formData.room_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, room_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="capacity">Capacidad *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="hourly_rate">Tarifa por hora (€)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ej: Edificio A, Planta 2"
              />
            </div>

            <div>
              <Label htmlFor="floor">Planta</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                placeholder="Ej: 2º Planta"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Descripción de la sala y sus características..."
            />
          </div>

          <div>
            <Label>Equipamiento disponible</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="Ej: Proyector, Pizarra..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
              />
              <Button type="button" onClick={addEquipment} variant="outline">
                Añadir
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipment_available.map((equipment, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {equipment}
                  <button
                    type="button"
                    onClick={() => removeEquipment(equipment)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_bookable"
              checked={formData.is_bookable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_bookable: checked }))}
            />
            <Label htmlFor="is_bookable">Permitir reservas</Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createRoom.isPending || updateRoom.isPending}
            >
              {room ? 'Actualizar' : 'Crear'} Sala
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
