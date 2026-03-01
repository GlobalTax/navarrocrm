import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface UserCredential {
  id: string
  user_id: string
  email: string
  encrypted_password: string
  created_at: string
  expires_at: string
  viewed_count: number
  last_viewed_at: string | null
}

export const useUserCredentials = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Obtener credenciales temporales del usuario actual
  const {
    data: credentials,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-credentials-temp', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      const { data, error } = await supabase
        .from('user_credentials_temp')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user credentials:', error)
        throw error
      }

      return data as UserCredential[]
    },
    enabled: !!user?.org_id
  })

  // Marcar credencial como vista y actualizar contador
  const viewCredentialMutation = useMutation({
    mutationFn: async (credentialId: string) => {
      // Primero obtenemos el valor actual
      const { data: current, error: fetchError } = await supabase
        .from('user_credentials_temp')
        .select('viewed_count')
        .eq('id', credentialId)
        .single()

      if (fetchError) throw fetchError

      // Luego actualizamos con el nuevo valor
      const { error } = await supabase
        .from('user_credentials_temp')  
        .update({
          viewed_count: (current.viewed_count || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', credentialId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-credentials-temp'] })
    },
    onError: (error) => {
      console.error('Error updating credential view count:', error)
    }
  })

  return {
    credentials: credentials || [],
    isLoading,
    error,
    viewCredential: viewCredentialMutation.mutate,
  }
}