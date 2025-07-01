
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useCreateSuperAdmin = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      // Insertar rol de super_admin
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'super_admin'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Super Admin creado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error creando Super Admin:', error)
      toast.error('Error al crear Super Admin')
    }
  })
}
