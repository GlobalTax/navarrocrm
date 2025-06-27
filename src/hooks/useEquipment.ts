
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Equipment } from '@/types/office'
import { toast } from 'sonner'

export const useEquipment = () => {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_inventory')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Equipment[]
    }
  })
}

export const useCreateEquipment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('equipment_inventory')
        .insert([equipment])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('Equipo registrado correctamente')
    },
    onError: (error) => {
      toast.error('Error al registrar el equipo: ' + error.message)
    }
  })
}

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Equipment> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipment_inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('Equipo actualizado correctamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar el equipo: ' + error.message)
    }
  })
}
