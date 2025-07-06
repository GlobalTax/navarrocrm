import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export type ConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'error'

export function useOutlookConnection() {
  const { user } = useApp()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('not_connected')

  // Verificar estado de conexión
  const { data: connectionData, refetch: refetchConnection } = useQuery({
    queryKey: ['outlook-connection', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error

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
    },
    enabled: !!user?.id,
    refetchInterval: 1000 * 60 * 5 // Verificar cada 5 minutos
  })

  // Conectar con Outlook
  const connectMutation = useMutation({
    mutationFn: async () => {
      setConnectionStatus('connecting')
      
      const { data, error } = await supabase.functions.invoke('outlook-auth', {
        body: {
          action: 'get_auth_url'
        }
      })

      if (error) throw error

      // Redirigir a la URL de autorización de Microsoft
      window.location.href = data.auth_url
    },
    onError: (error) => {
      setConnectionStatus('error')
      toast.error('Error al conectar con Outlook', {
        description: error.message
      })
    }
  })

  // Sincronizar emails
  const syncMutation = useMutation({
    mutationFn: async (fullSync: boolean = false) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase.functions.invoke('outlook-email-sync', {
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
      toast.success('Sincronización completada', {
        description: `${data.synced_messages} mensajes procesados`
      })
    },
    onError: (error) => {
      toast.error('Error en la sincronización', {
        description: error.message
      })
    }
  })

  const connect = useCallback(() => {
    connectMutation.mutate()
  }, [connectMutation])

  const syncEmails = useCallback((fullSync: boolean = false) => {
    syncMutation.mutate(fullSync)
  }, [syncMutation])

  return {
    connectionStatus,
    connectionData,
    isConnecting: connectMutation.isPending,
    isSyncing: syncMutation.isPending,
    connect,
    syncEmails,
    refetchConnection
  }
}