
import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { RoomsList } from '@/components/rooms/RoomsList'
import { RoomFormDialog } from '@/components/rooms/RoomFormDialog'
import { RoomReservationDialog } from '@/components/rooms/RoomReservationDialog'
import { useOfficeRooms } from '@/hooks/useOfficeRooms'
import { useRoomReservations } from '@/hooks/rooms/useRoomReservations'
import type { OfficeRoom } from '@/hooks/useOfficeRooms'

export default function Rooms() {
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false)
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<OfficeRoom | null>(null)
  const [editingRoom, setEditingRoom] = useState<OfficeRoom | null>(null)

  const { rooms, isLoading, createRoom, updateRoom, deleteRoom } = useOfficeRooms()
  const { createReservation } = useRoomReservations()

  const handleCreateRoom = () => {
    setEditingRoom(null)
    setIsRoomFormOpen(true)
  }

  const handleEditRoom = (room: OfficeRoom) => {
    setEditingRoom(room)
    setIsRoomFormOpen(true)
  }

  const handleReserveRoom = (room: OfficeRoom) => {
    setSelectedRoom(room)
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
          label: 'Ver Calendario',
          onClick: () => window.open('/calendar', '_blank')
        }}
      />

      <RoomsList
        rooms={rooms}
        isLoading={isLoading}
        onEditRoom={handleEditRoom}
        onDeleteRoom={deleteRoom}
        onReserveRoom={handleReserveRoom}
      />

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
      />
    </StandardPageContainer>
  )
}
