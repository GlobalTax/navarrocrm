
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Clock, Users, MapPin } from 'lucide-react'
import { useRoomReservations } from '@/hooks/useRoomReservations'

export const ReservationsManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { data: reservations = [], isLoading } = useRoomReservations()

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'confirmed': 'Confirmada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada'
    }
    return labels[status] || status
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return <div>Cargando reservas...</div>
  }

  // Agrupar reservas por fecha
  const reservationsByDate = reservations.reduce((acc, reservation) => {
    const date = new Date(reservation.start_datetime).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(reservation)
    return acc
  }, {} as Record<string, typeof reservations>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reservas de Salas</h2>
          <p className="text-gray-600">Gestiona las reservas de espacios</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Vista de calendario próximamente
            </p>
          </CardContent>
        </Card>

        {/* Lista de reservas */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(reservationsByDate).map(([date, dayReservations]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {formatDate(dayReservations[0].start_datetime)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayReservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{reservation.title}</h4>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(reservation.start_datetime)} - {formatTime(reservation.end_datetime)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{reservation.office_rooms?.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{reservation.attendees_count} personas</span>
                        </div>
                      </div>

                      {reservation.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {reservation.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      {reservation.status === 'confirmed' && (
                        <Button variant="outline" size="sm" className="text-red-600">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {reservations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay reservas registradas
                </h3>
                <p className="text-gray-500 mb-4">
                  Comienza creando tu primera reserva de sala
                </p>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primera Reserva
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
