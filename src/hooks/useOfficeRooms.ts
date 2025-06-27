
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { OfficeRoom } from '@/types/office'
import { toast } from 'sonner'

export const useOfficeRooms = () => {
  return useQuery({
    queryKey: ['office-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_rooms')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as OfficeRoom[]
    }
  })
}

export const useCreateOfficeRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (room: Omit<OfficeRoom, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('office_rooms')
        .insert([room])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-rooms'] })
      toast.success('Sala creada correctamente')
    },
    onError: (error) => {
      toast.error('Error al crear la sala: ' + error.message)
    }
  })
}

export const useUpdateOfficeRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OfficeRoom> & { id: string }) => {
      const { data, error } = await supabase
        .from('office_rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-rooms'] })
      toast.success('Sala actualizada correctamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar la sala: ' + error.message)
    }
  })
}

export const useDeleteOfficeRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('office_rooms')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-rooms'] })
      toast.success('Sala desactivada correctamente')
    },
    onError: (error) => {
      toast.error('Error al desactivar la sala: ' + error.message)
    }
  })
}
