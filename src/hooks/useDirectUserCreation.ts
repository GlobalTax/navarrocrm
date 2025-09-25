import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface CreateDirectUserParams {
  email: string
  role: string
  firstName?: string
  lastName?: string
}

interface CreatedUserCredentials {
  email: string
  password: string
  userId: string
}

export const useDirectUserCreation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()


  return useMutation<CreatedUserCredentials, Error, CreateDirectUserParams>({
    mutationFn: async ({ email, role, firstName = '', lastName = '' }: CreateDirectUserParams) => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      console.log('🔄 Creando usuario directo:', email, 'con rol:', role)

      // Llamar a la edge function para crear el usuario
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          role,
          firstName,
          lastName,
          orgId: user.org_id
        }
      })

      if (error) {
        console.error('❌ Error calling create-user function:', error)
        throw new Error(`Error creando usuario: ${error.message}`)
      }

      if (!data) {
        throw new Error('Error: No se recibió respuesta del servidor')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      console.log('✅ Usuario creado exitosamente:', data.userId)

      return {
        email: data.email,
        password: data.password,
        userId: data.userId
      }
    },
    onSuccess: (credentials) => {
      // Invalidar queries para actualizar las listas
      queryClient.invalidateQueries({ queryKey: ['users', user?.org_id] })
      queryClient.invalidateQueries({ queryKey: ['user-invitations', user?.org_id] })
      
      toast.success('Usuario creado exitosamente', {
        description: 'Credenciales generadas - compártelas de forma segura'
      })
    },
    onError: (error: any) => {
      console.error('Error creando usuario directo:', error)
      const errorMessage = error.message || 'Error creando el usuario'
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Por favor, revisa los datos e inténtalo de nuevo.'
      })
    },
  })
}