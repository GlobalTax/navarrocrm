
import { format, startOfDay, endOfDay, eachHourOfInterval, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Users } from 'lucide-react'
import type { OfficeRoom } from '@/hooks/useOfficeRooms'
import type { RoomReservation } from '@/hooks/rooms/types'

interface DayScheduleViewProps {
  room: OfficeRoom
  reservations: RoomReservation[]
  currentTime: Date
}

export const DayScheduleView: React.FC<DayScheduleViewProps> = ({
  room,
  reservations,
  currentTime
}) => {
  // Generar horas del día (8 AM a 10 PM)
  const startHour = new Date()
  startHour.setHours(8, 0, 0, 0)
  const endHour = new Date()
  endHour.setHours(22, 0, 0, 0)
  
  const hours = eachHourOfInterval({ start: startHour, end: endHour })

  // Filtrar reservas de hoy
  const todayReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.start_datetime)
    const today = new Date()
    return reservationDate.toDateString() === today.toDateString()
  })

  const getReservationForHour = (hour: Date) => {
    return todayReservations.find(reservation => {
      const start = new Date(reservation.start_datetime)
      const end = new Date(reservation.end_datetime)
      return isWithinInterval(hour, { start, end })
    })
  }

  const isCurrentHour = (hour: Date) => {
    return currentTime.getHours() === hour.getHours()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      {/* Header de la sala */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h3>
          <div className="flex items-center gap-4 text-gray-600">
            {room.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{room.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">{room.capacity} personas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cronograma del día */}
      <div className="space-y-2">
        {hours.map((hour) => {
          const reservation = getReservationForHour(hour)
          const isCurrent = isCurrentHour(hour)
          
          return (
            <div 
              key={hour.toISOString()}
              className={`flex items-center p-3 rounded-xl border transition-all duration-200 ${
                isCurrent 
                  ? 'bg-blue-50 border-blue-200 shadow-md' 
                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
              }`}
            >
              {/* Hora */}
              <div className={`w-20 text-center font-mono font-bold ${
                isCurrent ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {format(hour, 'HH:mm')}
              </div>

              {/* Estado/Reserva */}
              <div className="flex-1 ml-4">
                {reservation ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {reservation.purpose || reservation.title}
                      </div>
                      {reservation.user && (
                        <div className="text-sm text-gray-600">
                          {reservation.user.name}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {format(new Date(reservation.start_datetime), 'HH:mm')} - {format(new Date(reservation.end_datetime), 'HH:mm')}
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      Ocupada
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Libre</span>
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Disponible
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen del día */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-red-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-red-600">
              {todayReservations.length}
            </div>
            <div className="text-sm text-red-600">Reservas hoy</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-green-600">
              {hours.length - todayReservations.length}
            </div>
            <div className="text-sm text-green-600">Horas libres</div>
          </div>
        </div>
      </div>
    </div>
  )
}
