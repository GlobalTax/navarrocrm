import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useState, useEffect, useMemo } from 'react'

export type NylasConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'error'

export interface NylasConnection {
  grant_id: string
  application_id?: string
  account_id?: string
  email_address: string
  provider: string
  status: string
  scopes?: string[]
  last_sync?: string
}

export function useNylasConnection() {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [isCallbackOpen, setIsCallbackOpen] = useState(false)

  // Estado de conexión
  const { data: connection, isLoading: connectionLoading, refetch: refetchConnection } = useQuery({
    queryKey: ['nylas-connection', user?.id],
    queryFn: async (): Promise<NylasConnection | null> => {
      if (!user?.id) return null

      const { data, error } = await supabase.functions.invoke('nylas-auth', {
        body: {
          action: 'check_connection',
          user_id: user.id,
          org_id: user.org_id
        }
      })

      if (error) {
        console.error('Error verificando conexión Nylas:', error)
        return null
      }

      return data.connected ? {
        grant_id: data.grant_id || '',
        email_address: data.email || '',
        provider: data.provider || 'gmail',
        status: 'connected',
        last_sync: data.last_sync
      } : null
    },
    enabled: !!user?.id && !!user?.org_id,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    retry: 1
  })

  // Estado calculado
  const connectionStatus: NylasConnectionStatus = useMemo(() => {
    if (connectionLoading) return 'connecting'
    if (connection) return 'connected'
    return 'not_connected'
  }, [connectionLoading, connection])

  // Mutación para conectar
  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !user?.org_id) throw new Error('Usuario no encontrado o sin organización')

      console.log('Iniciando conexión con Nylas para usuario:', user.id, 'org:', user.org_id)

      // Obtener URL de autorización
      const { data, error } = await supabase.functions.invoke('nylas-auth', {
        body: {
          action: 'get_auth_url',
          user_id: user.id,
          org_id: user.org_id
        }
      })

      if (error) {
        console.error('Error obteniendo URL de autorización:', error)
        throw error
      }

      console.log('URL de autorización obtenida:', data.auth_url)
      return data.auth_url
    },
    onSuccess: (authUrl) => {
      console.log('Abriendo popup de autenticación con URL:', authUrl)
      
      // Abrir ventana popup para autenticación
      const popup = window.open(
        authUrl,
        'nylas-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes,location=yes'
      )

      if (!popup) {
        throw new Error('No se pudo abrir la ventana de autenticación. Verifique que no esté bloqueada por el navegador.')
      }

      setIsCallbackOpen(true)

      // Monitorear la ventana popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setIsCallbackOpen(false)
          console.log('Popup cerrado, verificando conexión...')
          // Verificar conexión después de cerrar popup
          setTimeout(() => refetchConnection(), 2000)
        }
      }, 1000)

      // Timeout para cerrar el popup si tarda mucho
      setTimeout(() => {
        if (!popup.closed) {
          popup.close()
          clearInterval(checkClosed)
          setIsCallbackOpen(false)
        }
      }, 5 * 60 * 1000) // 5 minutos
    },
    onError: (error) => {
      console.error('Error en conexión con Nylas:', error)
      setIsCallbackOpen(false)
    }
  })

  // Escuchar mensajes del popup de autenticación
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Verificar origen por seguridad
      if (event.origin !== window.location.origin) {
        console.warn('Mensaje de origen no autorizado:', event.origin)
        return
      }

      console.log('Mensaje recibido del popup:', event.data)

      if (event.data.type === 'nylas-auth-success' && event.data.code) {
        setIsCallbackOpen(false)
        
        try {
          console.log('Intercambiando código de autorización:', event.data.code)
          
          // Intercambiar código por token
          const { error } = await supabase.functions.invoke('nylas-auth', {
            body: {
              action: 'exchange_code',
              code: event.data.code,
              user_id: user?.id,
              org_id: user?.org_id
            }
          })

          if (error) {
            console.error('Error intercambiando código:', error)
            throw error
          }

          console.log('Código intercambiado exitosamente')
          
          // Actualizar estado de conexión
          await refetchConnection()
        } catch (error) {
          console.error('Error en intercambio de código:', error)
        }
      } else if (event.data.type === 'nylas-auth-error') {
        console.error('Error de autenticación:', event.data.error, event.data.description)
        setIsCallbackOpen(false)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [user?.id, user?.org_id, refetchConnection])

  // Mutación para sincronizar emails
  const syncMutation = useMutation({
    mutationFn: async (fullSync: boolean = false) => {
      if (!user?.id) throw new Error('Usuario no encontrado')

      const { data, error } = await supabase.functions.invoke('nylas-email-sync', {
        body: {
          user_id: user.id,
          org_id: user.org_id,
          full_sync: fullSync
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      console.log('Sincronización completada:', data)
      // Invalidar queries relacionadas con emails
      queryClient.invalidateQueries({ queryKey: ['email-metrics'] })
      queryClient.invalidateQueries({ queryKey: ['email-messages'] })
    },
    onError: (error) => {
      console.error('Error en sincronización:', error)
    }
  })

  return {
    connection,
    connectionStatus,
    isLoading: connectionLoading,
    isCallbackOpen,
    connect: connectMutation.mutate,
    isConnecting: connectMutation.isPending,
    syncEmails: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    error: connectMutation.error || syncMutation.error,
    refetchConnection
  }
}
