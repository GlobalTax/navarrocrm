
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  MapPin, 
  Monitor,
  Loader2 
} from 'lucide-react'
import type { OfficeRoom } from '@/hooks/useOfficeRooms'

interface RoomsListProps {
  rooms: OfficeRoom[]
  isLoading: boolean
  onEditRoom: (room: OfficeRoom) => void
  onDeleteRoom: (roomId: string) => void
  onReserveRoom: (room: OfficeRoom) => void
}

export const RoomsList: React.FC<RoomsListProps> = ({
  rooms,
  isLoading,
  onEditRoom,
  onDeleteRoom,
  onReserveRoom
}) => {
  const getRoomTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'meeting_room': 'Sala de Reuniones',
      'conference_room': 'Sala de Conferencias',
      'training_room': 'Sala de Formación',
      'office': 'Oficina',
      'coworking': 'Coworking',
      'phone_booth': 'Cabina Telefónica'
    }
    return types[type] || type
  }

  const getRoomTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'meeting_room': 'bg-blue-100 text-blue-800',
      'conference_room': 'bg-purple-100 text-purple-800',
      'training_room': 'bg-green-100 text-green-800',
      'office': 'bg-orange-100 text-orange-800',
      'coworking': 'bg-yellow-100 text-yellow-800',
      'phone_booth': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando salas...</span>
        </div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Monitor className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay salas registradas</h3>
          <p className="text-gray-500 text-center mb-4">
            Comienza creando tu primera sala para gestionar las reservas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <Card key={room.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">
                  {room.name}
                </CardTitle>
                {room.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {room.description}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={getRoomTypeColor(room.room_type)}>
                {getRoomTypeLabel(room.room_type)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
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
                  <p className="text-xs font-medium text-gray-700 mb-1">Equipamiento:</p>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment_available.slice(0, 3).map((equipment, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {equipment}
                      </Badge>
                    ))}
                    {room.equipment_available.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{room.equipment_available.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onReserveRoom(room)}
                  className="flex-1"
                  disabled={!room.is_bookable}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Reservar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditRoom(room)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteRoom(room.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
