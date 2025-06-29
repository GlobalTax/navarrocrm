
import { useEffect, useState } from 'react'
import { useOfficeRooms } from '@/hooks/useOfficeRooms'
import { useRoomReservationsQueries } from '@/hooks/rooms/useRoomReservationsQueries'
import { OccupancyHeader } from '@/components/rooms/OccupancyHeader'
import { DayScheduleView } from '@/components/rooms/DayScheduleView'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

  // Calcular estadísticas del día
  const today = new Date().toDateString()
  const todayReservations = reservations.filter(r => 
    new Date(r.start_datetime).toDateString() === today
  )
  
  const totalRooms = rooms.length
  const roomsWithReservations = new Set(todayReservations.map(r => r.room_id)).size
  const totalReservationsToday = todayReservations.length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl text-gray-700 font-medium">Cargando panel de ocupación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con estadísticas del día */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            
            {/* Título y hora */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Ocupación de Salas
              </h1>
              <div className="text-3xl lg:text-4xl font-mono text-blue-600 mb-2 font-bold">
                {format(currentTime, 'HH:mm:ss', { locale: es })}
              </div>
              <div className="text-xl lg:text-2xl text-gray-600 font-medium">
                {format(currentTime, 'EEEE, d MMMM yyyy', { locale: es })}
              </div>
            </div>

            {/* Estadísticas del día */}
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-2xl mb-3 mx-auto shadow-lg">
                  <span className="text-2xl lg:text-3xl font-bold text-blue-600">{totalRooms}</span>
                </div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">Total Salas</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-2xl mb-3 mx-auto shadow-lg">
                  <span className="text-2xl lg:text-3xl font-bold text-green-600">{roomsWithReservations}</span>
                </div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">Con Reservas</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-orange-100 rounded-2xl mb-3 mx-auto shadow-lg">
                  <span className="text-2xl lg:text-3xl font-bold text-orange-600">{totalReservationsToday}</span>
                </div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">Reservas Hoy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vista de cronograma para cada sala */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {rooms.map(room => {
            const roomReservations = reservations.filter(r => r.room_id === room.id)
            
            return (
              <DayScheduleView
                key={room.id}
                room={room}
                reservations={roomReservations}
                currentTime={currentTime}
              />
            )
          })}
        </div>

        {/* Footer con info de actualización */}
        <div className="text-center mt-8 text-lg text-gray-600 font-medium">
          Actualización automática cada 30 segundos • {format(currentTime, 'HH:mm:ss', { locale: es })}
        </div>
      </div>
    </div>
  )
}
