
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { RoomReservation } from './types'

export const useRoomReservationsQueries = (roomId?: string) => {
  const { user } = useApp()

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

      // Transform the data to ensure proper typing
      return (data || []).map(reservation => ({
        ...reservation,
        user: reservation.user || null
      })) as RoomReservation[]
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

      // Transform the data to ensure proper typing
      return (data || []).map(reservation => ({
        ...reservation,
        user: reservation.user || null
      })) as RoomReservation[]
    },
    enabled: !!user?.org_id && !!roomId,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  return {
    reservations,
    todayReservations,
    isLoading,
    error,
    refetch
  }
}
