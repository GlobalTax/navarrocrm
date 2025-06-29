
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface OfficeRoom {
  id: string
  name: string
  description?: string
  room_type: string
  capacity: number
  location?: string
  floor?: string
  hourly_rate?: number
  is_bookable: boolean
  is_active: boolean
  equipment_available?: string[]
  amenities?: any
  created_at: string
  updated_at: string
  org_id: string
}

export interface CreateRoomData {
  name: string
  description?: string
  room_type: string
  capacity: number
  location?: string
  floor?: string
  hourly_rate?: number
  is_bookable?: boolean
  equipment_available?: string[]
  amenities?: any
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  id: string
}

export const useOfficeRooms = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Obtener salas
  const { data: rooms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['office-rooms', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('office_rooms')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching office rooms:', error)
        throw error
      }

      return (data || []) as OfficeRoom[]
    },
    enabled: !!user?.org_id,
  })

  // Crear sala
  const createRoomMutation = useMutation({
    mutationFn: async (roomData: CreateRoomData) => {
      if (!user?.org_id) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('office_rooms')
        .insert({
          ...roomData,
          org_id: user.org_id,
          is_bookable: roomData.is_bookable ?? true
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-rooms'] })
      toast.success('Sala creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating room:', error)
      toast.error('Error al crear la sala')
    },
  })

  // Actualizar sala
  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateRoomData) => {
      const { data, error } = await supabase
        .from('office_rooms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-rooms'] })
      toast.success('Sala actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating room:', error)
      toast.error('Error al actualizar la sala')
    },
  })

  // Eliminar sala (marcar como inactiva)
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from('office_rooms')
        .update({ is_active: false })
        .eq('id', roomId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-rooms'] })
      toast.success('Sala eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting room:', error)
      toast.error('Error al eliminar la sala')
    },
  })

  return {
    rooms,
    isLoading,
    error,
    refetch,
    createRoom: createRoomMutation.mutate,
    updateRoom: updateRoomMutation.mutate,
    deleteRoom: deleteRoomMutation.mutate,
    isCreating: createRoomMutation.isPending,
    isUpdating: updateRoomMutation.isPending,
    isDeleting: deleteRoomMutation.isPending,
  }
}
