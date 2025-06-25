
import { useState, useEffect, useCallback } from 'react'
import { DatabaseOptimizer, DatabaseStats } from '@/services/database/DatabaseOptimizer'

export const useDatabaseStats = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const optimizer = DatabaseOptimizer.getInstance()

  useEffect(() => {
    const updateStats = () => {
      setStats(optimizer.getStats())
    }

    updateStats()
    const interval = setInterval(updateStats, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [optimizer])

  const resetStats = useCallback(() => {
    optimizer.resetStats()
    setStats(optimizer.getStats())
  }, [optimizer])

  return {
    stats,
    resetStats
  }
}
