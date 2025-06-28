
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  Settings,
  Edit,
  Trash2,
  Calendar,
  Building2
} from 'lucide-react'
import { useOfficeRooms, useDeleteOfficeRoom } from '@/hooks/useOfficeRooms'
import { OfficeRoomFormDialog } from './OfficeRoomFormDialog'
import { OfficeRoom } from '@/types/office'

export const OfficeRoomsManager = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<OfficeRoom | null>(null)
  
  const { data: rooms = [], isLoading } = useOfficeRooms()
  const deleteRoom = useDeleteOfficeRoom()

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (room: OfficeRoom) => {
    setSelectedRoom(room)
    setIsFormOpen(true)
  }

  const handleDelete = (room: OfficeRoom) => {
    if (confirm(`¿Estás seguro de que quieres desactivar la sala "${room.name}"?`)) {
      deleteRoom.mutate(room.id)
    }
  }

  const getRoomTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'meeting_room': 'Sala de Reuniones',
      'conference_room': 'Sala de Conferencias',
      'office': 'Oficina',
      'coworking': 'Coworking',
      'auditorium': 'Auditorio',
      'training_room': 'Sala de Formación'
    }
    return types[type] || type
  }

  const getRoomTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'meeting_room': 'bg-blue-100 text-blue-800',
      'conference_room': 'bg-green-100 text-green-800',
      'office': 'bg-gray-100 text-gray-800',
      'coworking': 'bg-purple-100 text-purple-800',
      'auditorium': 'bg-red-100 text-red-800',
      'training_room': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return <div>Cargando salas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón crear */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar salas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => {
            setSelectedRoom(null)
            setIsFormOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Sala
        </Button>
      </div>

      {/* Grid de salas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoomTypeColor(room.room_type)}>
                      {getRoomTypeLabel(room.room_type)}
                    </Badge>
                    {!room.is_bookable && (
                      <Badge variant="secondary">No Reservable</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(room)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(room)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {room.description && (
                <p className="text-sm text-gray-600">{room.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{room.capacity} personas</span>
                </div>
                {room.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{room.location}</span>
                  </div>
                )}
              </div>

              {room.equipment_available && room.equipment_available.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Equipamiento:</p>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment_available.slice(0, 3).map((equipment, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {equipment}
                      </Badge>
                    ))}
                    {room.equipment_available.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{room.equipment_available.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {room.hourly_rate > 0 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Tarifa por hora:</span>
                  <span className="font-medium">€{room.hourly_rate}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 flex items-center gap-1"
                  disabled={!room.is_bookable}
                >
                  <Calendar className="h-4 w-4" />
                  Reservar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(room)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron salas' : 'No hay salas registradas'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera sala de oficina'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => {
                  setSelectedRoom(null)
                  setIsFormOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Primera Sala
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <OfficeRoomFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        room={selectedRoom}
        onSuccess={() => {
          setIsFormOpen(false)
          setSelectedRoom(null)
        }}
      />
    </div>
  )
}
