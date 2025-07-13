import { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { OutlookAuthService } from '@/services/outlookAuthService'

export type ConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'error'

export function useOutlookConnection() {
  const { user } = useApp()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('not_connected')
  
  // Memoizar para evitar re-renderizados innecesarios
  const isUserReady = useMemo(() => !!user?.id && !!user?.org_id, [user?.id, user?.org_id])

  // Verificar estado de conexión con optimizaciones
  const { data: connectionData, refetch: refetchConnection } = useQuery({
    queryKey: ['outlook-connection', user?.id, user?.org_id],
    queryFn: async () => {
      if (!isUserReady) return null

      try {
        const { data, error } = await supabase
          .from('user_outlook_tokens')
          .select('*')
          .eq('user_id', user.id)
          .eq('org_id', user.org_id)
          .eq('is_active', true)
          .maybeSingle()

        if (error) {
          console.error('Error fetching outlook token:', error)
          setConnectionStatus('error')
          return null
        }

        // Verificar si el token no ha expirado
        if (data && new Date(data.token_expires_at) > new Date()) {
          setConnectionStatus('connected')
          return data
        } else if (data) {
          setConnectionStatus('error')
          return null
        } else {
          setConnectionStatus('not_connected')
          return null
        }
      } catch (error) {
        console.error('Connection check failed:', error)
        setConnectionStatus('error')
        return null
      }
    },
    enabled: isUserReady,
    refetchInterval: 1000 * 60 * 5, // Verificar cada 5 minutos
    retry: 1,
    staleTime: 1000 * 60 * 2 // 2 minutos
  })

  // Función para manejar OAuth con popup
  const handleOAuthCallback = useCallback((event: MessageEvent) => {
    if (event.data.type === 'OUTLOOK_AUTH_CODE') {
      // Exchange code for tokens
      exchangeCodeMutation.mutate(event.data.code)
    } else if (event.data.type === 'OUTLOOK_AUTH_ERROR') {
      toast.error('Error en la autenticación', {
        description: event.data.error
      })
      setConnectionStatus('error')
    }
  }, [])

  // Mutation para intercambiar código por tokens con retry logic
  const exchangeCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      console.log('🔄 [exchange_code] Iniciando intercambio de código...')
      
      // Usar el servicio para validar el token con retry
      const tokenValidation = await OutlookAuthService.validateAuthToken()
      
      if (!tokenValidation.isValid) {
        // Intentar reconexión automática
        console.log('🔄 [exchange_code] Token inválido, intentando reconexión...')
        const reconnected = await OutlookAuthService.handleReconnection(2)
        
        if (!reconnected) {
          throw new Error(tokenValidation.error || 'No se pudo validar la autenticación')
        }
        
        // Validar nuevamente después de la reconexión
        const newValidation = await OutlookAuthService.validateAuthToken()
        if (!newValidation.isValid) {
          throw new Error('Error de autenticación persistente. Reinicie sesión.')
        }
        
        tokenValidation.token = newValidation.token
      }
      
      console.log('📤 [exchange_code] Enviando petición con token validado')
      
      const { data, error } = await supabase.functions.invoke('outlook-auth', {
        body: {
          action: 'exchange_code',
          code: code
        },
        headers: {
          Authorization: `Bearer ${tokenValidation.token}`
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Conexión establecida con Outlook')
      setConnectionStatus('connected')
      refetchConnection()
    },
    onError: (error) => {
      console.error('❌ [exchange_code] Error final:', error)
      toast.error('Error al completar la autenticación', {
        description: error.message
      })
      setConnectionStatus('error')
    }
  })

  useEffect(() => {
    window.addEventListener('message', handleOAuthCallback)
    return () => window.removeEventListener('message', handleOAuthCallback)
  }, [handleOAuthCallback])

  // Conectar con Outlook usando popup con validación mejorada
  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!isUserReady) {
        throw new Error('Usuario no autenticado')
      }
      
      setConnectionStatus('connecting')
      
      try {
        // Usar el servicio para validar el token
        console.log('🔍 [connect] Validando autenticación...')
        const tokenValidation = await OutlookAuthService.validateAuthToken()
        
        if (!tokenValidation.isValid) {
          throw new Error(tokenValidation.error || 'Token de autenticación inválido')
        }
        
        console.log('📤 [connect] Enviando petición con token validado')
        
        console.log('🚀 [connect] Enviando petición a outlook-auth...')
        
        const { data, error } = await supabase.functions.invoke('outlook-auth', {
          body: {
            action: 'get_auth_url'
          },
          headers: {
            Authorization: `Bearer ${tokenValidation.token}`
          }
        })

        console.log('📡 [connect] Respuesta de outlook-auth:', { data, error })

        if (error) {
          console.error('❌ [connect] Error desde outlook-auth:', error)
          throw new Error(`Error al obtener URL de autorización: ${error.message || 'Error desconocido'}`)
        }

        // Abrir popup en lugar de redirección directa
        const popup = window.open(
          data.auth_url,
          'outlook-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        )

        if (!popup) {
          throw new Error('No se pudo abrir la ventana de autenticación. Verifique que los popups estén permitidos.')
        }

        // Monitorear si el popup se cierra sin completar la autenticación
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            if (connectionStatus === 'connecting') {
              setConnectionStatus('not_connected')
              toast.error('Autenticación cancelada')
            }
          }
        }, 1000)

        return { popup }
      } catch (error) {
        setConnectionStatus('error')
        throw error
      }
    },
    onError: (error) => {
      setConnectionStatus('error')
      toast.error('Error al conectar con Outlook', {
        description: error.message
      })
    }
  })

  // Sincronizar emails con optimizaciones
  const syncMutation = useMutation({
    mutationFn: async (fullSync: boolean = false) => {
      if (!isUserReady) {
        throw new Error('Usuario no autenticado')
      }

      if (connectionStatus !== 'connected') {
        throw new Error('Debe conectar con Outlook primero')
      }

      try {
        const { data, error } = await supabase.functions.invoke('outlook-email-sync', {
          body: {
            user_id: user.id,
            org_id: user.org_id,
            full_sync: fullSync
          }
        })

        if (error) throw error
        return data
      } catch (error) {
        console.error('Sync failed:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      toast.success('Sincronización completada', {
        description: `${data?.synced_messages || 0} mensajes procesados`
      })
    },
    onError: (error) => {
      toast.error('Error en la sincronización', {
        description: error.message
      })
    }
  })

  // Sincronizar contactos
  const syncContactsMutation = useMutation({
    mutationFn: async (forceSync: boolean = false) => {
      if (!isUserReady) {
        throw new Error('Usuario no autenticado')
      }

      if (connectionStatus !== 'connected') {
        throw new Error('Debe conectar con Outlook primero')
      }

      try {
        const { data, error } = await supabase.functions.invoke('outlook-contacts-sync', {
          body: {
            user_id: user.id,
            org_id: user.org_id,
            force_sync: forceSync
          }
        })

        if (error) throw error
        return data
      } catch (error) {
        console.error('Contacts sync failed:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      toast.success('Contactos sincronizados', {
        description: `${data?.synced_contacts || 0} contactos sincronizados`
      })
    },
    onError: (error) => {
      toast.error('Error sincronizando contactos', {
        description: error.message
      })
    }
  })

  const syncContacts = useCallback((forceSync: boolean = false) => {
    if (!isUserReady) {
      toast.error('Debe estar autenticado para sincronizar')
      return
    }
    if (connectionStatus !== 'connected') {
      toast.error('Debe conectar con Outlook primero')
      return
    }
    syncContactsMutation.mutate(forceSync)
  }, [syncContactsMutation, isUserReady, connectionStatus])

  const connect = useCallback(() => {
    if (!isUserReady) {
      toast.error('Debe estar autenticado para conectar')
      return
    }
    connectMutation.mutate()
  }, [connectMutation, isUserReady])

  const syncEmails = useCallback((fullSync: boolean = false) => {
    if (!isUserReady) {
      toast.error('Debe estar autenticado para sincronizar')
      return
    }
    if (connectionStatus !== 'connected') {
      toast.error('Debe conectar con Outlook primero')
      return
    }
    syncMutation.mutate(fullSync)
  }, [syncMutation, isUserReady, connectionStatus])

  return {
    connectionStatus,
    connectionData,
    isConnecting: connectMutation.isPending,
    isSyncing: syncMutation.isPending,
    isSyncingContacts: syncContactsMutation.isPending,
    connect,
    syncEmails,
    syncContacts,
    refetchConnection
  }
}