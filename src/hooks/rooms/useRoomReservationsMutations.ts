
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { CreateReservationData, UpdateReservationData } from './types'

export const useRoomReservationsMutations = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Crear reserva  
  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: CreateReservationData) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      // Verificar conflictos
      const { data: conflicts, error: conflictError } = await supabase
        .from('room_reservations')
        .select('id')
        .eq('room_id', reservationData.room_id)
        .in('status', ['confirmed', 'pending'])
        .or(`and(start_datetime.lte.${reservationData.end_datetime},end_datetime.gte.${reservationData.start_datetime})`)

      if (conflictError) throw conflictError

      if (conflicts && conflicts.length > 0) {
        throw new Error('La sala ya está reservada en ese horario')
      }

      const { data, error } = await supabase
        .from('room_reservations')
        .insert({
          room_id: reservationData.room_id,
          reserved_by: user.id,
          start_datetime: reservationData.start_datetime,
          end_datetime: reservationData.end_datetime,
          title: reservationData.title,
          purpose: reservationData.purpose,
          attendees_count: reservationData.attendees_count,
          attendees_emails: reservationData.attendees_emails,
          setup_requirements: reservationData.setup_requirements,
          catering_requested: reservationData.catering_requested,
          org_id: user.org_id,
          status: 'confirmed'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['today-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Reserva creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating reservation:', error)
      toast.error(error.message || 'Error al crear la reserva')
    },
  })

  // Actualizar reserva
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateReservationData) => {
      const { data, error } = await supabase
        .from('room_reservations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['today-reservations'] })
      toast.success('Reserva actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating reservation:', error)
      toast.error('Error al actualizar la reserva')
    },
  })

  // Cancelar reserva
  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      const { error } = await supabase
        .from('room_reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['today-reservations'] })
      toast.success('Reserva cancelada exitosamente')
    },
    onError: (error) => {
      console.error('Error cancelling reservation:', error)
      toast.error('Error al cancelar la reserva')
    },
  })

  return {
    createReservation: createReservationMutation.mutate,
    updateReservation: updateReservationMutation.mutate,
    cancelReservation: cancelReservationMutation.mutate,
    isCreating: createReservationMutation.isPending,
    isUpdating: updateReservationMutation.isPending,
    isCancelling: cancelReservationMutation.isPending,
  }
}
