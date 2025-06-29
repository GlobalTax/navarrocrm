
import { useEffect, useState } from 'react'
import { useOfficeRooms } from '@/hooks/useOfficeRooms'
import { useRoomReservations } from '@/hooks/rooms/useRoomReservations'
import { OccupancyHeader } from '@/components/rooms/OccupancyHeader'
import { RoomStatusCard } from '@/components/rooms/RoomStatusCard'
import { format, isAfter, isBefore, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

export default function RoomOccupancyPanel() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { rooms, isLoading } = useOfficeRooms()
  const { reservations } = useRoomReservations()

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      window.location.reload()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Actualizar reloj cada segundo
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  // Calcular estadísticas generales
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(room => {
    const roomReservations = reservations.filter(r => r.room_id === room.id)
    return roomReservations.some(reservation => {
      const start = new Date(reservation.start_datetime)
      const end = new Date(reservation.end_datetime)
      return isAfter(currentTime, start) && isBefore(currentTime, end)
    })
  }).length

  const availableRooms = totalRooms - occupiedRooms

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando panel de ocupación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <OccupancyHeader
          currentTime={currentTime}
          totalRooms={totalRooms}
          occupiedRooms={occupiedRooms}
          availableRooms={availableRooms}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {rooms.map(room => {
            const roomReservations = reservations.filter(r => r.room_id === room.id)
            
            // Buscar reserva actual
            const currentReservation = roomReservations.find(reservation => {
              const start = new Date(reservation.start_datetime)
              const end = new Date(reservation.end_datetime)
              return isAfter(currentTime, start) && isBefore(currentTime, end)
            })

            // Buscar próxima reserva
            const nextReservation = roomReservations
              .filter(reservation => isAfter(new Date(reservation.start_datetime), currentTime))
              .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
              [0]

            // Determinar estado
            let status: 'available' | 'occupied' | 'soon' = 'available'
            if (currentReservation) {
              status = 'occupied'
            } else if (nextReservation && 
              isBefore(new Date(nextReservation.start_datetime), addMinutes(currentTime, 30))) {
              status = 'soon'
            }

            return (
              <RoomStatusCard
                key={room.id}
                room={room}
                status={status}
                currentReservation={currentReservation}
                nextReservation={nextReservation}
                currentTime={currentTime}
              />
            )
          })}
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          Actualización automática cada 30 segundos • {format(currentTime, 'HH:mm:ss', { locale: es })}
        </div>
      </div>
    </div>
  )
}
