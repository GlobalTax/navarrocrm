
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Clock, AlertCircle, CheckCircle, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OfficeRoom } from '@/hooks/useOfficeRooms'
import type { RoomReservation } from '@/hooks/rooms/types'

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
          bgColor: 'bg-amber-50 border-amber-200',
          iconColor: 'text-amber-600',
          icon: Clock,
          statusText: 'PRÓXIMA RESERVA',
          statusColor: 'bg-amber-500 text-white'
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
    <div className={`${config.bgColor} rounded-2xl border-2 shadow-lg p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 backdrop-blur-sm bg-opacity-80`}>
      
      {/* Header de la sala */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{room.name}</h3>
          {room.location && (
            <div className="flex items-center text-base md:text-lg text-gray-600 mb-2">
              <MapPin className="h-5 w-5 md:h-6 md:w-6 mr-2" />
              {room.location}
            </div>
          )}
          <div className="flex items-center text-base md:text-lg text-gray-600">
            <Users className="h-5 w-5 md:h-6 md:w-6 mr-2" />
            Capacidad: {room.capacity} personas
          </div>
        </div>
        <StatusIcon className={`h-12 w-12 md:h-16 md:w-16 ${config.iconColor}`} />
      </div>

      {/* Badge de estado */}
      <div className="mb-6">
        <Badge className={`${config.statusColor} text-base md:text-lg font-bold px-4 py-2 rounded-xl`}>
          {config.statusText}
        </Badge>
      </div>

      {/* Información de reserva actual */}
      {currentReservation && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-red-600" />
            <span className="font-bold text-red-600 text-lg">Reserva Actual</span>
          </div>
          <div className="space-y-3 text-base md:text-lg">
            <div>
              <span className="font-semibold">Propósito:</span> {currentReservation.purpose || currentReservation.title}
            </div>
            <div>
              <span className="font-semibold">Horario:</span>{' '}
              {format(new Date(currentReservation.start_datetime), 'HH:mm')} -{' '}
              {format(new Date(currentReservation.end_datetime), 'HH:mm')}
            </div>
            {currentReservation.user && (
              <div>
                <span className="font-semibold">Reservado por:</span> {currentReservation.user.name}
              </div>
            )}
            <div className="text-red-600 font-bold text-lg">
              Termina en: {calculateTimeRemaining(currentReservation.end_datetime)}
            </div>
          </div>
        </div>
      )}

      {/* Información de próxima reserva */}
      {nextReservation && !currentReservation && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-blue-600 text-lg">Próxima Reserva</span>
          </div>
          <div className="space-y-3 text-base md:text-lg">
            <div>
              <span className="font-semibold">Propósito:</span> {nextReservation.purpose || nextReservation.title}
            </div>
            <div>
              <span className="font-semibold">Horario:</span>{' '}
              {format(new Date(nextReservation.start_datetime), 'HH:mm')} -{' '}
              {format(new Date(nextReservation.end_datetime), 'HH:mm')}
            </div>
            {nextReservation.user && (
              <div>
                <span className="font-semibold">Reservado por:</span> {nextReservation.user.name}
              </div>
            )}
            <div className="text-blue-600 font-bold text-lg">
              Comienza en: {calculateTimeUntil(nextReservation.start_datetime)}
            </div>
          </div>
        </div>
      )}

      {/* Estado disponible */}
      {status === 'available' && !nextReservation && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 md:h-20 md:w-20 text-green-600 mx-auto mb-4" />
            <p className="text-green-600 font-bold text-xl md:text-2xl">Libre todo el día</p>
          </div>
        </div>
      )}
    </div>
  )
}
