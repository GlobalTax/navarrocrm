
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useCreateSuperAdmin = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔄 Creando Super Admin para usuario:', userId)
      
      // Verificar primero si el usuario existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('❌ Error verificando usuario:', userError)
        throw new Error(`Usuario no encontrado: ${userError.message}`)
      }

      console.log('✅ Usuario encontrado:', user)

      // Verificar si ya tiene el rol de super_admin
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'super_admin')
        .maybeSingle()

      if (roleCheckError) {
        console.error('❌ Error verificando roles existentes:', roleCheckError)
        throw new Error(`Error verificando roles: ${roleCheckError.message}`)
      }

      if (existingRole) {
        console.log('⚠️ Usuario ya tiene rol de super_admin')
        throw new Error('El usuario ya tiene el rol de Super Admin')
      }

      // Insertar rol de super_admin
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'super_admin'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error insertando rol:', error)
        throw new Error(`Error creando Super Admin: ${error.message}`)
      }

      console.log('✅ Super Admin creado exitosamente:', data)
      return data
    },
    onSuccess: () => {
      toast.success('Super Admin creado exitosamente')
    },
    onError: (error: any) => {
      console.error('❌ Error en mutación:', error)
      toast.error(error.message || 'Error al crear Super Admin')
    }
  })
}
