
import { useEffect, useState } from 'react'
import { useOfficeRooms } from '@/hooks/useOfficeRooms'
import { useRoomReservationsQueries } from '@/hooks/rooms/useRoomReservationsQueries'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function RoomOccupancyPanel() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { rooms, isLoading } = useOfficeRooms()
  const { reservations, refetch } = useRoomReservationsQueries()

  // Auto-refresh datos cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)

    return () => clearInterval(interval)
  }, [refetch])

  // Actualizar reloj cada segundo
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  // Generar horas del día (8 AM a 10 PM)
  const generateHours = () => {
    const hours = []
    for (let i = 8; i <= 22; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`)
    }
    return hours
  }

  const hours = generateHours()

  const getReservationsForRoom = (roomId: string) => {
    const today = new Date().toDateString()
    return reservations.filter(r => 
      r.room_id === roomId && 
      new Date(r.start_datetime).toDateString() === today
    )
  }

  const isTimeSlotOccupied = (roomId: string, timeSlot: string) => {
    const roomReservations = getReservationsForRoom(roomId)
    const [hour] = timeSlot.split(':')
    const slotTime = new Date()
    slotTime.setHours(parseInt(hour), 0, 0, 0)

    return roomReservations.some(reservation => {
      const start = new Date(reservation.start_datetime)
      const end = new Date(reservation.end_datetime)
      return slotTime >= start && slotTime < end
    })
  }

  const getReservationForTimeSlot = (roomId: string, timeSlot: string) => {
    const roomReservations = getReservationsForRoom(roomId)
    const [hour] = timeSlot.split(':')
    const slotTime = new Date()
    slotTime.setHours(parseInt(hour), 0, 0, 0)

    return roomReservations.find(reservation => {
      const start = new Date(reservation.start_datetime)
      const end = new Date(reservation.end_datetime)
      return slotTime >= start && slotTime < end
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando panel de ocupación...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-200 rounded-lg">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-medium text-gray-900">
              1st Floor rooms
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-mono text-gray-900">
              {format(currentTime, 'HH:mm', { locale: es })}
            </div>
            <div className="text-gray-600">joan</div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => {
            const roomReservations = getReservationsForRoom(room.id)
            
            return (
              <div key={room.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                
                {/* Room Header */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-1">{room.name}</h3>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <span>👥</span>
                    <span>{room.capacity} PEOPLE LIMIT</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-4">
                  <div className="space-y-1">
                    {hours.map(timeSlot => {
                      const isOccupied = isTimeSlotOccupied(room.id, timeSlot)
                      const reservation = getReservationForTimeSlot(room.id, timeSlot)
                      const currentHour = format(currentTime, 'HH:00')
                      const isCurrentTime = timeSlot === currentHour

                      return (
                        <div 
                          key={timeSlot}
                          className={`flex items-center gap-3 py-2 px-2 rounded ${
                            isCurrentTime ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                          }`}
                        >
                          {/* Time */}
                          <div className={`text-sm font-mono w-12 ${
                            isCurrentTime ? 'text-blue-600 font-medium' : 'text-gray-500'
                          }`}>
                            {timeSlot}
                          </div>

                          {/* Status */}
                          <div className="flex-1">
                            {isOccupied && reservation ? (
                              <div className="bg-gray-100 rounded px-2 py-1">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {reservation.purpose || reservation.title}
                                </div>
                                {reservation.user && (
                                  <div className="text-xs text-gray-600 truncate">
                                    {reservation.user.name}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {format(new Date(reservation.start_datetime), 'HH:mm')}-{format(new Date(reservation.end_datetime), 'HH:mm')}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">
                                Private
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Room Stats */}
                <div className="px-4 pb-4">
                  <div className="text-xs text-gray-500">
                    {roomReservations.length} reservas hoy
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-center mt-8 gap-2">
          <button className="p-2 hover:bg-gray-200 rounded-lg">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
