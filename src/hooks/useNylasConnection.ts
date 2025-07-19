
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'

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
        console.log('🔍 [useNylasConnection] No user ID available')
        return null
      }

      console.log('🔍 [useNylasConnection] Checking connection for user:', {
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
        console.error('❌ [useNylasConnection] Error verificando conexión:', error)
        throw new Error(`Error verificando conexión: ${error.message}`)
      }

      console.log('✅ [useNylasConnection] Connection check result:', {
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
      console.error('🔴 [useNylasConnection] Connection error:', connectionError)
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

      console.log('🚀 [useNylasConnection] Iniciando conexión:', {
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
        console.error('❌ [useNylasConnection] Error obteniendo URL:', error)
        throw new Error(`Error obteniendo URL de autorización: ${error.message}`)
      }

      console.log('✅ [useNylasConnection] Auth URL obtenida')
      return data.auth_url
    },
    onSuccess: (authUrl) => {
      console.log('🪟 [useNylasConnection] Abriendo popup de auth')
      
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
          console.log('🪟 [useNylasConnection] Popup cerrado, verificando conexión...')
          setTimeout(() => refetchConnection(), 2000)
        }
      }, 1000)

      // Timeout de seguridad
      setTimeout(() => {
        if (!popup.closed) {
          popup.close()
          clearInterval(checkClosed)
          setIsCallbackOpen(false)
          toast.error('Timeout', {
            description: 'La autenticación tomó demasiado tiempo'
          })
        }
      }, 5 * 60 * 1000)
    },
    onError: (error) => {
      console.error('❌ [useNylasConnection] Connect error:', error)
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
        console.warn('⚠️ [useNylasConnection] Mensaje de origen no autorizado:', event.origin)
        return
      }

      console.log('📨 [useNylasConnection] Mensaje del popup:', event.data)

      if (event.data.type === 'nylas-auth-success' && event.data.code) {
        setIsCallbackOpen(false)
        
        try {
          console.log('🔄 [useNylasConnection] Intercambiando código')
          
          const { data, error } = await supabase.functions.invoke('nylas-auth', {
            body: {
              action: 'exchange_code',
              code: event.data.code,
              user_id: user?.id,
              org_id: user?.org_id
            }
          })

          if (error) {
            console.error('❌ [useNylasConnection] Error intercambiando código:', error)
            toast.error('Error de Autenticación', {
              description: 'No se pudo completar la autenticación'
            })
            throw error
          }

          console.log('✅ [useNylasConnection] Autenticación exitosa')
          toast.success('¡Conectado!', {
            description: `Cuenta conectada: ${data.email}`
          })
          
          await refetchConnection()
        } catch (error) {
          console.error('❌ [useNylasConnection] Error en intercambio:', error)
        }
      } else if (event.data.type === 'nylas-auth-error') {
        console.error('❌ [useNylasConnection] Auth error:', event.data)
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

      console.log('🔄 [useNylasConnection] Iniciando sincronización:', { fullSync })

      const { data, error } = await supabase.functions.invoke('nylas-email-sync', {
        body: {
          user_id: user.id,
          org_id: user.org_id,
          full_sync: fullSync
        }
      })

      if (error) {
        console.error('❌ [useNylasConnection] Sync error:', error)
        throw new Error(`Error de sincronización: ${error.message}`)
      }

      console.log('✅ [useNylasConnection] Sync completed:', data)
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
      console.error('❌ [useNylasConnection] Sync failed:', error)
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
