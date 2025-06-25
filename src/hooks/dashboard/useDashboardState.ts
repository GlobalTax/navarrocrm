
import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { toast } from 'sonner'

export const useDashboardState = () => {
  const { user, authLoading } = useApp()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const shouldLoadStats = Boolean(user && user.org_id)
  const { stats, isLoading, error, refetch } = useDashboardStats()

  useEffect(() => {
    if (shouldLoadStats) {
      refetch()
      setLastRefresh(new Date())
    }
  }, [user, refetch, shouldLoadStats])

  const handleRefresh = async () => {
    try {
      await refetch()
      setLastRefresh(new Date())
      toast.success('Dashboard actualizado', {
        description: 'Los datos se han actualizado correctamente'
      })
    } catch (error) {
      console.error('Dashboard: Error refreshing:', error)
      toast.error('Error al actualizar', {
        description: 'No se pudieron actualizar los datos'
      })
    }
  }

  const formatTime = (date: Date) => date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return {
    user,
    authLoading,
    stats,
    isLoading,
    error,
    lastRefresh,
    shouldLoadStats,
    handleRefresh,
    formatTime
  }
}
