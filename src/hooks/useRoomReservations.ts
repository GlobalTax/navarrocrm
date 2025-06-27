import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { RoomReservation } from '@/types/office'
import { toast } from 'sonner'

type ReservationWithRelations = RoomReservation & {
  office_rooms: { name: string }
  users: { name: string | null } | null
}

export const useRoomReservations = (roomId?: string) => {
  return useQuery({
    queryKey: ['room-reservations', roomId],
    queryFn: async () => {
      let query = supabase
        .from('room_reservations')
        .select(`
          *,
          office_rooms!inner(name),
          users(name)
        `)
        .order('start_datetime')

      if (roomId) {
        query = query.eq('room_id', roomId)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Transform the data to match our expected types
      const transformedData: ReservationWithRelations[] = (data || []).map(item => ({
        ...item,
        status: item.status as 'confirmed' | 'pending' | 'cancelled', // Type assertion for status
        office_rooms: item.office_rooms,
        users: item.users
      }))
      
      return transformedData
    }
  })
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reservation: Omit<RoomReservation, 'id' | 'created_at' | 'updated_at'>) => {
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      const { data, error } = await supabase
        .from('room_reservations')
        .insert([{
          ...reservation,
          org_id: user.data.user.user_metadata.org_id
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-reservations'] })
      toast.success('Reserva creada correctamente')
    },
    onError: (error) => {
      toast.error('Error al crear la reserva: ' + error.message)
    }
  })
}

export const useCancelReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('room_reservations')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-reservations'] })
      toast.success('Reserva cancelada correctamente')
    },
    onError: (error) => {
      toast.error('Error al cancelar la reserva: ' + error.message)
    }
  })
}
