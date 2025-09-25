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

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  return useMutation<CreatedUserCredentials, Error, CreateDirectUserParams>({
    mutationFn: async ({ email, role, firstName = '', lastName = '' }: CreateDirectUserParams) => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      console.log('🔄 Creando usuario directo:', email, 'con rol:', role)

      // Verificar si el usuario ya existe
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('org_id', user.org_id)
        .maybeSingle()

      if (userCheckError) {
        console.error('❌ Error verificando usuario existente:', userCheckError)
      }

      if (existingUser) {
        throw new Error('Este usuario ya existe en tu organización')
      }

      // Generar contraseña temporal
      const temporaryPassword = generateSecurePassword()

      // Crear usuario en Supabase Auth usando Admin API
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true, // Auto-confirmar email para aplicación interna
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          org_id: user.org_id,
          role
        }
      })

      if (authError) {
        console.error('❌ Error creando usuario en Auth:', authError)
        throw new Error(`Error creando usuario: ${authError.message}`)
      }

      if (!authUser.user) {
        throw new Error('Error: No se pudo crear el usuario')
      }

      // Crear registro en la tabla users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email,
          role,
          org_id: user.org_id,
          first_name: firstName || null,
          last_name: lastName || null,
          is_active: true
        })

      if (profileError) {
        console.error('❌ Error creando perfil de usuario:', profileError)
        
        // Si falla la creación del perfil, eliminamos el usuario de Auth
        try {
          await supabase.auth.admin.deleteUser(authUser.user.id)
        } catch (cleanupError) {
          console.error('❌ Error limpiando usuario de Auth:', cleanupError)
        }
        
        throw new Error(`Error creando perfil: ${profileError.message}`)
      }

      console.log('✅ Usuario creado exitosamente:', authUser.user.id)

      return {
        email,
        password: temporaryPassword,
        userId: authUser.user.id
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