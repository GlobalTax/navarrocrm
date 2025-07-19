import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useState, useEffect, useMemo } from 'react'

export type NylasConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'error'

export interface NylasConnection {
  grant_id: string
  email_address: string
  provider: string
  status: string
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
    enabled: !!user?.id,
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
      if (!user?.id) throw new Error('Usuario no encontrado')

      // Obtener URL de autorización
      const { data, error } = await supabase.functions.invoke('nylas-auth', {
        body: {
          action: 'get_auth_url',
          user_id: user.id,
          org_id: user.org_id
        }
      })

      if (error) throw error

      return data.auth_url
    },
    onSuccess: (authUrl) => {
      // Abrir ventana popup para autenticación
      const popup = window.open(
        authUrl,
        'nylas-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      setIsCallbackOpen(true)

      // Monitorear la ventana popup
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsCallbackOpen(false)
          // Verificar conexión después de cerrar popup
          setTimeout(() => refetchConnection(), 1000)
        }
      }, 1000)
    },
    onError: (error) => {
      console.error('Error en conexión con Nylas:', error)
      setIsCallbackOpen(false)
    }
  })

  // Escuchar mensajes del popup de autenticación
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'nylas-auth-success' && event.data.code) {
        setIsCallbackOpen(false)
        
        try {
          // Intercambiar código por token
          const { error } = await supabase.functions.invoke('nylas-auth', {
            body: {
              action: 'exchange_code',
              code: event.data.code,
              user_id: user?.id,
              org_id: user?.org_id
            }
          })

          if (error) throw error

          // Actualizar estado de conexión
          await refetchConnection()
        } catch (error) {
          console.error('Error intercambiando código:', error)
        }
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