
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRoomReservations } from '@/hooks/rooms/useRoomReservations'
import { useOfficeRooms } from '@/hooks/useOfficeRooms'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { format, isAfter, isBefore, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react'

export default function RoomDisplay() {
  const { roomId } = useParams<{ roomId: string }>()
  const { rooms } = useOfficeRooms()
  const { todayReservations } = useRoomReservations(roomId)

  const room = rooms.find(r => r.id === roomId)
  const now = new Date()

  // Buscar la reserva actual
  const currentReservation = todayReservations.find(reservation => {
    const start = new Date(reservation.start_datetime)
    const end = new Date(reservation.end_datetime)
    return isAfter(now, start) && isBefore(now, end)
  })

  // Buscar la próxima reserva
  const nextReservation = todayReservations
    .filter(reservation => isAfter(new Date(reservation.start_datetime), now))
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
    [0]

  // Estado de la sala
  const roomStatus = currentReservation ? 'occupied' : 'available'
  const isAvailableSoon = nextReservation && 
    isBefore(new Date(nextReservation.start_datetime), addMinutes(now, 15))

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Sala no encontrada</h1>
          <p className="text-gray-400">La sala solicitada no existe o no está disponible</p>
        </div>
      </div>
    )
  }

  const getStatusColor = () => {
    if (roomStatus === 'occupied') return 'bg-red-500'
    if (isAvailableSoon) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (roomStatus === 'occupied') return 'OCUPADA'
    if (isAvailableSoon) return 'DISPONIBLE (próxima reserva pronto)'
    return 'DISPONIBLE'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header con estado de la sala */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold mb-2">{room.name}</h1>
          
          <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-2xl font-bold ${getStatusColor()}`}>
            {roomStatus === 'occupied' ? (
              <AlertCircle className="h-8 w-8" />
            ) : (
              <CheckCircle className="h-8 w-8" />
            )}
            {getStatusText()}
          </div>

          <div className="flex items-center justify-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="text-xl">Capacidad: {room.capacity} personas</span>
            </div>
            {room.location && (
              <div className="flex items-center gap-2">
                <span className="text-xl">📍 {room.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reloj actual */}
        <div className="text-center">
          <div className="text-4xl font-mono text-blue-400 mb-2">
            {format(now, 'HH:mm:ss', { locale: es })}
          </div>
          <div className="text-xl text-gray-400">
            {format(now, 'EEEE, d MMMM yyyy', { locale: es })}
          </div>
        </div>

        {/* Reserva actual */}
        {currentReservation && (
          <Card className="bg-red-900/50 border-red-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-bold text-red-400">Reserva Actual</h2>
              </div>
              <div className="grid grid-cols-2 gap-6 text-lg">
                <div>
                  <p className="text-gray-300 mb-1">Propósito:</p>
                  <p className="font-semibold">{currentReservation.purpose}</p>
                </div>
                <div>
                  <p className="text-gray-300 mb-1">Horario:</p>
                  <p className="font-semibold">
                    {format(new Date(currentReservation.start_datetime), 'HH:mm')} - {' '}
                    {format(new Date(currentReservation.end_datetime), 'HH:mm')}
                  </p>
                </div>
                {currentReservation.user && (
                  <div>
                    <p className="text-gray-300 mb-1">Reservado por:</p>
                    <p className="font-semibold">{currentReservation.user.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-300 mb-1">Termina en:</p>
                  <p className="font-semibold text-red-400">
                    {Math.ceil((new Date(currentReservation.end_datetime).getTime() - now.getTime()) / (1000 * 60))} minutos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Próxima reserva */}
        {nextReservation && (
          <Card className="bg-blue-900/50 border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-blue-400">Próxima Reserva</h2>
              </div>
              <div className="grid grid-cols-2 gap-6 text-lg">
                <div>
                  <p className="text-gray-300 mb-1">Propósito:</p>
                  <p className="font-semibold">{nextReservation.purpose}</p>
                </div>
                <div>
                  <p className="text-gray-300 mb-1">Horario:</p>
                  <p className="font-semibold">
                    {format(new Date(nextReservation.start_datetime), 'HH:mm')} - {' '}
                    {format(new Date(nextReservation.end_datetime), 'HH:mm')}
                  </p>
                </div>
                {nextReservation.user && (
                  <div>
                    <p className="text-gray-300 mb-1">Reservado por:</p>
                    <p className="font-semibold">{nextReservation.user.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-300 mb-1">Comienza en:</p>
                  <p className="font-semibold text-blue-400">
                    {Math.ceil((new Date(nextReservation.start_datetime).getTime() - now.getTime()) / (1000 * 60))} minutos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reservas del día */}
        {todayReservations.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-6 w-6 text-gray-400" />
                <h2 className="text-2xl font-bold">Reservas de Hoy</h2>
              </div>
              <div className="space-y-3">
                {todayReservations.map((reservation, index) => {
                  const start = new Date(reservation.start_datetime)
                  const end = new Date(reservation.end_datetime)
                  const isActive = isAfter(now, start) && isBefore(now, end)
                  const isPast = isBefore(end, now)
                  
                  return (
                    <div 
                      key={reservation.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isActive ? 'bg-red-700/50' : isPast ? 'bg-gray-700/50' : 'bg-blue-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-mono">
                          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                        </div>
                        <div>
                          <p className="font-semibold">{reservation.purpose}</p>
                          {reservation.user && (
                            <p className="text-sm text-gray-400">{reservation.user.name}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={isActive ? 'destructive' : isPast ? 'secondary' : 'default'}>
                        {isActive ? 'En curso' : isPast ? 'Finalizada' : 'Programada'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          Actualizado automáticamente cada 30 segundos
        </div>
      </div>
    </div>
  )
}
