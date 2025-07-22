
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export const useUserRoles = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['user-roles', user?.org_id],
    queryFn: async () => {
      console.log('🔄 Verificando tabla user_roles para org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id disponible')
        return []
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .limit(10)

      if (error) {
        console.error('❌ Error consultando user_roles:', error)
        throw error
      }

      console.log('✅ Roles encontrados:', data?.length || 0)
      console.log('📋 Datos de roles:', data)
      
      return data || []
    },
    enabled: !!user?.org_id,
  })
}
