
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOfficeRooms } from '@/hooks/useOfficeRooms'
import { useRoomReservationsQueries } from '@/hooks/rooms/useRoomReservationsQueries'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, Home, Monitor, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function RoomOccupancyPanel() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { rooms, isLoading } = useOfficeRooms()
  const { reservations, refetch } = useRoomReservationsQueries()
  const navigate = useNavigate()

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

  // Navegación por teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [navigate])

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
        
        {/* Header con navegación mejorada */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/rooms')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Gestión Salas
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Panel de Ocupación • Planta 1
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-gray-900">
                  {format(currentTime, 'HH:mm:ss', { locale: es })}
                </div>
                <div className="text-sm text-gray-600">
                  {format(currentTime, 'EEEE, d MMMM', { locale: es })}
                </div>
              </div>
              <Badge variant="outline" className="ml-2">
                {rooms.length} salas
              </Badge>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-gray-900">
            Dashboard
          </button>
          <span>/</span>
          <button onClick={() => navigate('/rooms')} className="hover:text-gray-900">
            Salas
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Panel de Ocupación</span>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {rooms.map(room => {
            const roomReservations = getReservationsForRoom(room.id)
            const occupiedSlots = hours.filter(hour => isTimeSlotOccupied(room.id, hour)).length
            const availableSlots = hours.length - occupiedSlots
            
            return (
              <div key={room.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* Room Header */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span>👥 {room.capacity} personas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={occupiedSlots > 0 ? "destructive" : "secondary"} className="text-xs">
                        {occupiedSlots > 0 ? `${occupiedSlots} ocupadas` : 'Libre'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Timeline vertical */}
                <div className="p-6">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {hours.map(timeSlot => {
                      const isOccupied = isTimeSlotOccupied(room.id, timeSlot)
                      const reservation = getReservationForTimeSlot(room.id, timeSlot)
                      const currentHour = format(currentTime, 'HH:00')
                      const isCurrentTime = timeSlot === currentHour

                      return (
                        <div 
                          key={timeSlot}
                          className={`flex items-center gap-4 py-3 px-3 rounded-lg border transition-all ${
                            isCurrentTime 
                              ? 'bg-blue-50 border-blue-200 shadow-sm' 
                              : isOccupied
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {/* Time indicator */}
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              isCurrentTime 
                                ? 'bg-blue-500 animate-pulse' 
                                : isOccupied 
                                  ? 'bg-red-500' 
                                  : 'bg-gray-300'
                            }`} />
                            <div className={`text-sm font-mono font-medium w-14 ${
                              isCurrentTime ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {timeSlot}
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex-1 min-w-0">
                            {isOccupied && reservation ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {reservation.purpose || reservation.title || 'Reserva'}
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
                              <div className="text-sm text-gray-500">
                                Disponible
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Room Footer Stats */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-red-600">{occupiedSlots}</div>
                      <div className="text-xs text-gray-600">Ocupadas</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{availableSlots}</div>
                      <div className="text-xs text-gray-600">Libres</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer con ayuda */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            Presiona <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd> para volver al dashboard
          </div>
        </div>
      </div>
    </div>
  )
}
