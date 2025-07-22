
import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { RoomsList } from '@/components/rooms/RoomsList'
import { RoomCalendarView } from '@/components/rooms/RoomCalendarView'
import { RoomFormDialog } from '@/components/rooms/RoomFormDialog'
import { RoomReservationDialog } from '@/components/rooms/RoomReservationDialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOfficeRooms } from '@/hooks/useOfficeRooms'
import { useRoomReservations } from '@/hooks/rooms/useRoomReservations'
import { Grid3X3, Calendar, Monitor } from 'lucide-react'
import type { OfficeRoom } from '@/hooks/useOfficeRooms'

export default function Rooms() {
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false)
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<OfficeRoom | null>(null)
  const [editingRoom, setEditingRoom] = useState<OfficeRoom | null>(null)
  const [reservationDate, setReservationDate] = useState<Date | null>(null)

  const { rooms, isLoading, createRoom, updateRoom, deleteRoom } = useOfficeRooms()
  const { reservations, createReservation } = useRoomReservations()

  const handleCreateRoom = () => {
    setEditingRoom(null)
    setIsRoomFormOpen(true)
  }

  const handleEditRoom = (room: OfficeRoom) => {
    setEditingRoom(room)
    setIsRoomFormOpen(true)
  }

  const handleReserveRoom = (room: OfficeRoom, date?: Date) => {
    setSelectedRoom(room)
    setReservationDate(date || null)
    setIsReservationFormOpen(true)
  }

  const handleRoomSubmit = (roomData: any) => {
    if (editingRoom) {
      updateRoom({ id: editingRoom.id, ...roomData })
    } else {
      createRoom(roomData)
    }
    setIsRoomFormOpen(false)
    setEditingRoom(null)
  }

  const handleReservationSubmit = (reservationData: any) => {
    if (selectedRoom) {
      createReservation({
        ...reservationData,
        room_id: selectedRoom.id
      })
    }
    setIsReservationFormOpen(false)
    setSelectedRoom(null)
    setReservationDate(null)
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Gestión de Salas"
        description="Administra las salas de la oficina y sus reservas"
        primaryAction={{
          label: 'Nueva Sala',
          onClick: handleCreateRoom
        }}
        secondaryAction={{
          label: 'Panel Ocupación',
          onClick: () => window.open('/panel-ocupacion', '_blank')
        }}
      />

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Vista Lista
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Vista Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <RoomsList
            rooms={rooms}
            isLoading={isLoading}
            onEditRoom={handleEditRoom}
            onDeleteRoom={deleteRoom}
            onReserveRoom={(room) => handleReserveRoom(room)}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <RoomCalendarView
            rooms={rooms}
            reservations={reservations}
            onReserveRoom={handleReserveRoom}
          />
        </TabsContent>
      </Tabs>

      <RoomFormDialog
        open={isRoomFormOpen}
        onOpenChange={setIsRoomFormOpen}
        onSubmit={handleRoomSubmit}
        room={editingRoom}
        title={editingRoom ? 'Editar Sala' : 'Nueva Sala'}
      />

      <RoomReservationDialog
        open={isReservationFormOpen}
        onOpenChange={setIsReservationFormOpen}
        onSubmit={handleReservationSubmit}
        room={selectedRoom}
        preselectedDate={reservationDate}
      />
    </StandardPageContainer>
  )
}
