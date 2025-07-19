
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { createLogger } from '@/utils/logger'

// Logger específico para Nylas
const nylasLogger = createLogger('Nylas')

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

  // Estado de conexión con mejor logging
  const { data: connection, isLoading: connectionLoading, refetch: refetchConnection, error: connectionError } = useQuery({
    queryKey: ['nylas-connection', user?.id],
    queryFn: async (): Promise<NylasConnection | null> => {
      if (!user?.id) {
        nylasLogger.debug('No user ID available')
        return null
      }

      nylasLogger.info('Checking connection for user', {
        userId: user.id,
        orgId: user.org_id
      })

      const { data, error } = await supabase.functions.invoke('nylas-auth', {
        body: {
          action: 'check_connection',
          user_id: user.id,
          org_id: user.org_id
        }
      })

      if (error) {
        nylasLogger.error('Error checking connection', error)
        throw new Error(`Error verificando conexión: ${error.message}`)
      }

      nylasLogger.info('Connection check result', {
        connected: data.connected,
        email: data.email,
        provider: data.provider
      })

      return data.connected ? {
        grant_id: data.grant_id || '',
        email_address: data.email || '',
        provider: data.provider || 'gmail',
        status: 'connected',
        last_sync: data.last_sync,
        account_id: data.account_id
      } : null
    },
    enabled: !!user?.id && !!user?.org_id,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    retry: 1
  })

  // Estado calculado con mejor granularidad
  const connectionStatus: NylasConnectionStatus = useMemo(() => {
    if (connectionLoading) return 'connecting'
    if (connectionError) {
      nylasLogger.error('Connection error detected', connectionError)
      return 'error'
    }
    if (connection) return 'connected'
    return 'not_connected'
  }, [connectionLoading, connectionError, connection])

  // Mutación para conectar con mejor logging
  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no encontrado o sin organización')
      }

      nylasLogger.info('Starting connection process', {
        userId: user.id,
        orgId: user.org_id
      })

      const { data, error } = await supabase.functions.invoke('nylas-auth', {
        body: {
          action: 'get_auth_url',
          user_id: user.id,
          org_id: user.org_id
        }
      })

      if (error) {
        nylasLogger.error('Error getting auth URL', error)
        throw new Error(`Error obteniendo URL de autorización: ${error.message}`)
      }

      nylasLogger.info('Auth URL obtained successfully')
      return data.auth_url
    },
    onSuccess: (authUrl) => {
      nylasLogger.info('Opening auth popup')
      
      const popup = window.open(
        authUrl,
        'nylas-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes,location=yes'
      )

      if (!popup) {
        toast.error('Error de Popup', {
          description: 'No se pudo abrir la ventana de autenticación. Verifique los bloqueos del navegador.'
        })
        throw new Error('No se pudo abrir la ventana de autenticación')
      }

      setIsCallbackOpen(true)

      // Monitorear popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setIsCallbackOpen(false)
          nylasLogger.info('Popup closed, checking connection status')
          setTimeout(() => refetchConnection(), 2000)
        }
      }, 1000)

      // Timeout de seguridad
      setTimeout(() => {
        if (!popup.closed) {
          popup.close()
          clearInterval(checkClosed)
          setIsCallbackOpen(false)
          nylasLogger.warn('Auth popup timeout')
          toast.error('Timeout', {
            description: 'La autenticación tomó demasiado tiempo'
          })
        }
      }, 5 * 60 * 1000)
    },
    onError: (error) => {
      nylasLogger.error('Connect mutation failed', error)
      setIsCallbackOpen(false)
      toast.error('Error de Conexión', {
        description: error.message || 'No se pudo conectar con Nylas'
      })
    }
  })

  // Escuchar mensajes del popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        nylasLogger.warn('Message from unauthorized origin', event.origin)
        return
      }

      nylasLogger.debug('Received popup message', event.data)

      if (event.data.type === 'nylas-auth-success' && event.data.code) {
        setIsCallbackOpen(false)
        
        try {
          nylasLogger.info('Exchanging authorization code')
          
          const { data, error } = await supabase.functions.invoke('nylas-auth', {
            body: {
              action: 'exchange_code',
              code: event.data.code,
              user_id: user?.id,
              org_id: user?.org_id
            }
          })

          if (error) {
            nylasLogger.error('Code exchange failed', error)
            toast.error('Error de Autenticación', {
              description: 'No se pudo completar la autenticación'
            })
            throw error
          }

          nylasLogger.info('Authentication successful', { email: data.email })
          toast.success('¡Conectado!', {
            description: `Cuenta conectada: ${data.email}`
          })
          
          await refetchConnection()
        } catch (error) {
          nylasLogger.error('Error during code exchange', error)
        }
      } else if (event.data.type === 'nylas-auth-error') {
        nylasLogger.error('Auth error from popup', event.data)
        setIsCallbackOpen(false)
        toast.error('Error de Autenticación', {
          description: event.data.description || 'Error durante la autenticación'
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [user?.id, user?.org_id, refetchConnection])

  // Mutación para sincronizar emails
  const syncMutation = useMutation({
    mutationFn: async (fullSync: boolean = false) => {
      if (!user?.id) throw new Error('Usuario no encontrado')

      nylasLogger.info('Starting email sync', { fullSync })

      const { data, error } = await supabase.functions.invoke('nylas-email-sync', {
        body: {
          user_id: user.id,
          org_id: user.org_id,
          full_sync: fullSync
        }
      })

      if (error) {
        nylasLogger.error('Email sync failed', error)
        throw new Error(`Error de sincronización: ${error.message}`)
      }

      nylasLogger.info('Email sync completed', data)
      return data
    },
    onSuccess: (data) => {
      toast.success('Sincronización Completa', {
        description: `Se sincronizaron ${data.synced_messages || 0} mensajes`
      })
      
      queryClient.invalidateQueries({ queryKey: ['email-metrics'] })
      queryClient.invalidateQueries({ queryKey: ['email-messages'] })
    },
    onError: (error) => {
      nylasLogger.error('Sync mutation failed', error)
      toast.error('Error de Sincronización', {
        description: error.message || 'No se pudieron sincronizar los emails'
      })
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
    error: connectMutation.error || syncMutation.error || connectionError,
    refetchConnection
  }
}
