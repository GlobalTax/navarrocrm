
import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { OfficeRoom } from '@/hooks/useOfficeRooms'
import type { RoomReservation } from '@/hooks/rooms/types'

interface RoomCalendarViewProps {
  rooms: OfficeRoom[]
  reservations: RoomReservation[]
  onReserveRoom?: (room: OfficeRoom, date: Date) => void
}

export const RoomCalendarView: React.FC<RoomCalendarViewProps> = ({
  rooms,
  reservations,
  onReserveRoom
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Generar días del mes para el calendario
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Lunes
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Obtener reservas por día
  const reservationsByDay = useMemo(() => {
    const map = new Map<string, RoomReservation[]>()
    
    reservations.forEach(reservation => {
      const date = new Date(reservation.start_datetime)
      const dateKey = format(date, 'yyyy-MM-dd')
      
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(reservation)
    })
    
    return map
  }, [reservations])

  // Obtener reservas del día seleccionado
  const selectedDayReservations = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return reservationsByDay.get(dateKey) || []
  }, [selectedDate, reservationsByDay])

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setIsDialogOpen(true)
  }

  const handleReserveClick = (room: OfficeRoom) => {
    if (selectedDate && onReserveRoom) {
      onReserveRoom(room, selectedDate)
      setIsDialogOpen(false)
    }
  }

  const getDayReservationsCount = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    return reservationsByDay.get(dateKey)?.length || 0
  }

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    return room?.name || 'Sala desconocida'
  }

  return (
    <div className="space-y-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setCurrentDate(new Date())}
        >
          Hoy
        </Button>
      </div>

      {/* Grid del calendario */}
      <Card>
        <CardContent className="p-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => {
              const dayReservationsCount = getDayReservationsCount(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isDayToday = isToday(day)
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative p-3 h-20 border rounded-lg text-left transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isDayToday ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'}
                    ${dayReservationsCount > 0 ? 'border-blue-300 bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-medium ${isDayToday ? 'text-primary-600' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {dayReservationsCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayReservationsCount}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Indicadores de reservas */}
                  {dayReservationsCount > 0 && (
                    <div className="mt-1 space-y-1">
                      {reservationsByDay.get(format(day, 'yyyy-MM-dd'))?.slice(0, 2).map((reservation, index) => (
                        <div key={index} className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate">
                          {format(new Date(reservation.start_datetime), 'HH:mm')} - {getRoomName(reservation.room_id)}
                        </div>
                      ))}
                      {dayReservationsCount > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayReservationsCount - 2} más
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalles del día */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDayReservations.length > 0 ? (
              <>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Reservas del día ({selectedDayReservations.length})</h4>
                  <div className="space-y-3">
                    {selectedDayReservations.map(reservation => (
                      <Card key={reservation.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{getRoomName(reservation.room_id)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {format(new Date(reservation.start_datetime), 'HH:mm')} - 
                                  {format(new Date(reservation.end_datetime), 'HH:mm')}
                                </span>
                              </div>
                              
                              {reservation.purpose && (
                                <p className="text-sm text-gray-600">{reservation.purpose}</p>
                              )}
                              
                              {reservation.user && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Users className="h-4 w-4" />
                                  <span>{reservation.user.name || reservation.user.email}</span>
                                </div>
                              )}
                            </div>
                            
                            <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                              {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">No hay reservas este día</h4>
                <p className="text-gray-500 mb-6">¿Te gustaría hacer una reserva?</p>
              </div>
            )}

            {/* Salas disponibles para reservar */}
            {selectedDate && rooms.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Reservar sala</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rooms.filter(room => room.is_bookable).map(room => (
                    <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-sm">{room.name}</h5>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Users className="h-3 w-3" />
                              <span>{room.capacity} personas</span>
                              {room.location && (
                                <>
                                  <MapPin className="h-3 w-3 ml-2" />
                                  <span>{room.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleReserveClick(room)}
                          >
                            Reservar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
