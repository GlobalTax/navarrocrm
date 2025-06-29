
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Clock, AlertCircle, CheckCircle, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OfficeRoom } from '@/hooks/useOfficeRooms'
import type { RoomReservation } from '@/hooks/rooms/useRoomReservations'

interface RoomStatusCardProps {
  room: OfficeRoom
  status: 'available' | 'occupied' | 'soon'
  currentReservation?: RoomReservation
  nextReservation?: RoomReservation
  currentTime: Date
}

export const RoomStatusCard: React.FC<RoomStatusCardProps> = ({
  room,
  status,
  currentReservation,
  nextReservation,
  currentTime
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'occupied':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          icon: AlertCircle,
          statusText: 'OCUPADA',
          statusColor: 'bg-red-500 text-white'
        }
      case 'soon':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          icon: Clock,
          statusText: 'PRÓXIMA RESERVA',
          statusColor: 'bg-yellow-500 text-white'
        }
      default:
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          icon: CheckCircle,
          statusText: 'DISPONIBLE',
          statusColor: 'bg-green-500 text-white'
        }
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  const calculateTimeRemaining = (endTime: string) => {
    const end = new Date(endTime)
    const diffMs = end.getTime() - currentTime.getTime()
    const diffMinutes = Math.ceil(diffMs / (1000 * 60))
    
    if (diffMinutes > 60) {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
    return `${diffMinutes}m`
  }

  const calculateTimeUntil = (startTime: string) => {
    const start = new Date(startTime)
    const diffMs = start.getTime() - currentTime.getTime()
    const diffMinutes = Math.ceil(diffMs / (1000 * 60))
    
    if (diffMinutes > 60) {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
    return `${diffMinutes}m`
  }

  return (
    <div className={`${config.bgColor} rounded-[10px] border-0.5 border-black p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}>
      
      {/* Header de la sala */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
          {room.location && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {room.location}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            Capacidad: {room.capacity} personas
          </div>
        </div>
        <StatusIcon className={`h-8 w-8 ${config.iconColor}`} />
      </div>

      {/* Badge de estado */}
      <div className="mb-4">
        <Badge className={`${config.statusColor} text-sm font-semibold px-3 py-1 rounded-[10px]`}>
          {config.statusText}
        </Badge>
      </div>

      {/* Información de reserva actual */}
      {currentReservation && (
        <div className="bg-white rounded-[10px] border-0.5 border-black p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-red-600" />
            <span className="font-semibold text-red-600">Reserva Actual</span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Propósito:</span> {currentReservation.purpose || currentReservation.title}
            </div>
            <div>
              <span className="font-medium">Horario:</span>{' '}
              {format(new Date(currentReservation.start_datetime), 'HH:mm')} -{' '}
              {format(new Date(currentReservation.end_datetime), 'HH:mm')}
            </div>
            {currentReservation.user && (
              <div>
                <span className="font-medium">Reservado por:</span> {currentReservation.user.name}
              </div>
            )}
            <div className="text-red-600 font-semibold">
              Termina en: {calculateTimeRemaining(currentReservation.end_datetime)}
            </div>
          </div>
        </div>
      )}

      {/* Información de próxima reserva */}
      {nextReservation && !currentReservation && (
        <div className="bg-white rounded-[10px] border-0.5 border-black p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-600">Próxima Reserva</span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Propósito:</span> {nextReservation.purpose || nextReservation.title}
            </div>
            <div>
              <span className="font-medium">Horario:</span>{' '}
              {format(new Date(nextReservation.start_datetime), 'HH:mm')} -{' '}
              {format(new Date(nextReservation.end_datetime), 'HH:mm')}
            </div>
            {nextReservation.user && (
              <div>
                <span className="font-medium">Reservado por:</span> {nextReservation.user.name}
              </div>
            )}
            <div className="text-blue-600 font-semibold">
              Comienza en: {calculateTimeUntil(nextReservation.start_datetime)}
            </div>
          </div>
        </div>
      )}

      {/* Estado disponible */}
      {status === 'available' && !nextReservation && (
        <div className="bg-white rounded-[10px] border-0.5 border-black p-4">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-600 font-semibold">Libre todo el día</p>
          </div>
        </div>
      )}
    </div>
  )
}
