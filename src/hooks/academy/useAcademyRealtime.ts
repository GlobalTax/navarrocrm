import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export const useAcademyRealtime = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

  useEffect(() => {
    if (!user?.org_id) return

    setConnectionStatus('connecting')

    // Canal para cambios en progreso de usuario
    const progressChannel = supabase
      .channel('academy-user-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'academy_user_progress',
          filter: `org_id=eq.${user.org_id}`,
        },
        (payload) => {
          console.log('Progress change:', payload)
          
          // Invalidar queries de progreso
          queryClient.invalidateQueries({ 
            queryKey: ['academy-user-progress'] 
          })
          
          // Si es progreso del usuario actual, invalidar inmediatamente
          if ((payload.new as any)?.user_id === user.id) {
            queryClient.invalidateQueries({ 
              queryKey: ['academy-user-progress', user.org_id, user.id] 
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'academy_courses',
          filter: `org_id=eq.${user.org_id}`,
        },
        (payload) => {
          console.log('Course change:', payload)
          
          // Invalidar queries de cursos
          queryClient.invalidateQueries({ 
            queryKey: ['academy-courses'] 
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'academy_categories',
          filter: `org_id=eq.${user.org_id}`,
        },
        (payload) => {
          console.log('Category change:', payload)
          
          // Invalidar queries de categorías
          queryClient.invalidateQueries({ 
            queryKey: ['academy-categories'] 
          })
        }
      )
      .subscribe((status) => {
        console.log('Academy realtime status:', status)
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected')
      })

    return () => {
      setConnectionStatus('disconnected')
      supabase.removeChannel(progressChannel)
    }
  }, [user?.org_id, user?.id, queryClient])

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  }
}