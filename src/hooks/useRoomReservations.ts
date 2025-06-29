
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface RoomReservation {
  id: string
  room_id: string
  reserved_by: string
  start_datetime: string
  end_datetime: string
  title: string
  purpose?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  attendees_count?: number
  attendees_emails?: string[]
  setup_requirements?: string
  cost?: number
  catering_requested?: boolean
  approved_by?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
  org_id: string
  // Relaciones
  room?: {
    id: string
    name: string
    capacity: number
    location?: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateReservationData {
  room_id: string
  start_datetime: string
  end_datetime: string
  title: string
  purpose?: string
  attendees_count?: number
  attendees_emails?: string[]
  setup_requirements?: string
  catering_requested?: boolean
}

export interface UpdateReservationData extends Partial<CreateReservationData> {
  id: string
  status?: 'pending' | 'confirmed' | 'cancelled'
}

export const useRoomReservations = (roomId?: string) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Obtener reservas
  const { data: reservations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['room-reservations', roomId, user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      let query = supabase
        .from('room_reservations')
        .select(`
          *,
          room:office_rooms(id, name, capacity, location),
          user:users(id, name, email)
        `)
        .eq('org_id', user.org_id)
        .order('start_datetime', { ascending: true })

      if (roomId) {
        query = query.eq('room_id', roomId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching room reservations:', error)
        throw error
      }

      return (data || []) as any[]
    },
    enabled: !!user?.org_id,
  })

  // Obtener reservas del día actual para una sala específica
  const { data: todayReservations = [] } = useQuery({
    queryKey: ['today-reservations', roomId, user?.org_id],
    queryFn: async () => {
      if (!user?.org_id || !roomId) return []

      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const { data, error } = await supabase
        .from('room_reservations')
        .select(`
          *,
          room:office_rooms(id, name, capacity, location),
          user:users(id, name, email)
        `)
        .eq('org_id', user.org_id)
        .eq('room_id', roomId)
        .gte('start_datetime', startOfDay)
        .lte('start_datetime', endOfDay)
        .in('status', ['confirmed', 'pending'])
        .order('start_datetime', { ascending: true })

      if (error) {
        console.error('Error fetching today reservations:', error)
        throw error
      }

      return (data || []) as any[]
    },
    enabled: !!user?.org_id && !!roomId,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

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
    reservations,
    todayReservations,
    isLoading,
    error,
    refetch,
    createReservation: createReservationMutation.mutate,
    updateReservation: updateReservationMutation.mutate,
    cancelReservation: cancelReservationMutation.mutate,
    isCreating: createReservationMutation.isPending,
    isUpdating: updateReservationMutation.isPending,
    isCancelling: cancelReservationMutation.isPending,
  }
}
