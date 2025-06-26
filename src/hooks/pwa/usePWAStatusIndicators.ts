
import { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'

export const usePWAStatusIndicators = () => {
  const { isOnline, isUpdateAvailable, updatePWA, getCacheStats } = usePWA()
  
  const [showConnected, setShowConnected] = useState(false)
  const [showOffline, setShowOffline] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [cacheStats, setCacheStats] = useState<any>(null)

  useEffect(() => {
    if (isOnline) {
      setShowConnected(true)
      setShowOffline(false)
      const timer = setTimeout(() => setShowConnected(false), 3000)
      return () => clearTimeout(timer)
    } else {
      setShowOffline(true)
      setShowConnected(false)
    }
  }, [isOnline])

  useEffect(() => {
    setShowUpdate(isUpdateAvailable)
  }, [isUpdateAvailable])

  useEffect(() => {
    const loadCacheStats = async () => {
      const stats = await getCacheStats()
      setCacheStats(stats)
    }
    loadCacheStats()
  }, [getCacheStats])

  const handleUpdateApp = () => {
    updatePWA()
    setShowUpdate(false)
  }

  const handleDismissConnected = () => {
    setShowConnected(false)
  }

  const handleDismissOffline = () => {
    setShowOffline(false)
  }

  const handleDismissUpdate = () => {
    setShowUpdate(false)
  }

  return {
    showConnected,
    showOffline,
    showUpdate,
    cacheStats,
    isOnline,
    handleUpdateApp,
    handleDismissConnected,
    handleDismissOffline,
    handleDismissUpdate
  }
}
