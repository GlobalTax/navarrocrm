import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface RegeneratePasswordParams {
  userId: string
}

interface RegeneratedCredentials {
  email: string
  password: string
  userId: string
}

export const useRegeneratePassword = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [regeneratedCredentials, setRegeneratedCredentials] = useState<RegeneratedCredentials | null>(null)

  const regeneratePasswordMutation = useMutation<RegeneratedCredentials, Error, RegeneratePasswordParams>({
    mutationFn: async ({ userId }: RegeneratePasswordParams) => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      console.log('🔄 Regenerando contraseña para usuario:', userId)

      // Llamar a la edge function para regenerar la contraseña
      const { data, error } = await supabase.functions.invoke('regenerate-user-password', {
        body: {
          userId,
          orgId: user.org_id
        }
      })

      if (error) {
        console.error('❌ Error calling regenerate-user-password function:', error)
        throw new Error(`Error regenerando contraseña: ${error.message}`)
      }

      if (!data) {
        throw new Error('Error: No se recibió respuesta del servidor')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      console.log('✅ Contraseña regenerada exitosamente:', data.userId)

      return {
        email: data.email,
        password: data.password,
        userId: data.userId
      }
    },
    onSuccess: (credentials) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['users', user?.org_id] })
      queryClient.invalidateQueries({ queryKey: ['user-credentials-temp', user?.org_id] })
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] })
      queryClient.invalidateQueries({ queryKey: ['employee_profiles'] })
      
      // Guardar credenciales para mostrarlas
      setRegeneratedCredentials(credentials)
      
      toast.success('Contraseña regenerada exitosamente', {
        description: 'Nueva contraseña generada - compártela de forma segura'
      })
    },
    onError: (error: any) => {
      console.error('Error regenerando contraseña:', error)
      let errorMessage = error.message || 'Error regenerando la contraseña'
      let description = 'Inténtalo de nuevo más tarde.'
      
      // Detectar errores específicos
      if (error.message?.includes('403') || error.message?.includes('401')) {
        errorMessage = 'Falta configurar la clave de servicio'
        description = 'Contacta al administrador para configurar SUPABASE_SERVICE_ROLE_KEY en las funciones.'
      } else if (error.message?.includes('CORS') || error.message?.includes('preflight')) {
        errorMessage = 'Error de configuración CORS'
        description = 'Revisa CORS/OPTIONS en la función y verify_jwt en config.toml.'
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        description
      })
    },
  })

  const clearCredentials = () => {
    setRegeneratedCredentials(null)
  }

  return {
    regeneratePassword: regeneratePasswordMutation.mutate,
    isRegenerating: regeneratePasswordMutation.isPending,
    regeneratedCredentials,
    clearCredentials
  }
}