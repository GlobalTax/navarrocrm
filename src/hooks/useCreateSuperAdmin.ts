
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useCreateSuperAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      
      
      // Verificar primero si el usuario existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, role, org_id')
        .eq('id', userId)
        .maybeSingle()

      if (userError) {
        
        throw new Error(`Usuario no encontrado: ${userError.message}`)
      }

      

      // Verificar si ya tiene el rol de super_admin
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'super_admin')
        .maybeSingle()

      if (roleCheckError && roleCheckError.code !== 'PGRST116') {
        console.error('❌ Error verificando roles existentes:', roleCheckError)
        throw new Error(`Error verificando roles: ${roleCheckError.message}`)
      }

      if (existingRole) {
        console.log('⚠️ Usuario ya tiene rol de super_admin')
        throw new Error('El usuario ya tiene el rol de Super Admin')
      }

      // Verificar cuántos super admins existen actualmente
      const { data: existingSuperAdmins, error: countError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin')

      if (countError) {
        console.warn('⚠️ No se pudo verificar super admins existentes:', countError)
      }

      const isBootstrap = !existingSuperAdmins || existingSuperAdmins.length === 0

      console.log('📊 Estado del sistema:', {
        isBootstrap,
        existingSuperAdmins: existingSuperAdmins?.length || 0,
        targetUser: user.email
      })

      // Insertar rol de super_admin
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'super_admin'
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error('❌ Error insertando rol:', error)
        
        // Proporcionar mensajes de error más específicos
        if (error.message.includes('row-level security')) {
          throw new Error('Error de permisos: Las políticas de seguridad no permiten esta operación. Esto puede ocurrir si hay un problema con la configuración inicial del sistema.')
        } else if (error.code === '23505') {
          throw new Error('El usuario ya tiene el rol de Super Admin')
        } else {
          throw new Error(`Error creando Super Admin: ${error.message}`)
        }
      }

      console.log('✅ Super Admin creado exitosamente:', data)
      
      return {
        role: data,
        user: user,
        isBootstrap
      }
    },
    onSuccess: (result) => {
      const message = result.isBootstrap 
        ? `🎉 Super Admin configurado exitosamente para ${result.user.email}. Sistema listo para usar.`
        : `✅ Super Admin creado exitosamente para ${result.user.email}`
        
      toast.success(message)
      
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['user-roles'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      console.log('🔄 Queries invalidadas - datos actualizándose')
    },
    onError: (error: any) => {
      console.error('❌ Error en mutación:', error)
      
      const errorMessage = error.message || 'Error desconocido al crear Super Admin'
      toast.error(errorMessage)
    }
  })
}
