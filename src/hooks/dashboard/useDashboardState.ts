
import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { toast } from 'sonner'

export const useDashboardState = () => {
  const { user, authLoading } = useApp()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const initialLoadRef = useRef(false)

  const shouldLoadStats = Boolean(user && user.org_id)
  const { stats, isLoading, error, refetch } = useDashboardStats()

  // Estabilizar handleRefresh
  const handleRefresh = useCallback(async () => {
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
  }, [refetch])

  // Carga inicial solo una vez
  useEffect(() => {
    if (shouldLoadStats && !initialLoadRef.current && !isLoading) {
      initialLoadRef.current = true
      setLastRefresh(new Date())
      // No llamar refetch aquí para evitar bucle
    }
  }, [shouldLoadStats, isLoading])

  const formatTime = useCallback((date: Date) => date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }), [])

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
