import { useState, useEffect } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

interface NetworkStatusReturn extends NetworkStatus {
  reconnectAttempts: number
  lastOnlineTime: number | null
  timeSinceLastOnline: number | null
}

export function useNetworkStatus(): NetworkStatusReturn {
  const logger = useLogger('NetworkStatus')
  
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [lastOnlineTime, setLastOnlineTime] = useState<number | null>(
    navigator.onLine ? Date.now() : null
  )
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  })

  // Get network information if available
  const getNetworkInfo = () => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection

    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      }
    }

    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false
    }
  }

  // Update network info
  const updateNetworkInfo = () => {
    const info = getNetworkInfo()
    setNetworkInfo(info)
    
    logger.info('🌐 Info de red actualizada', {
      effectiveType: info.effectiveType,
      downlink: info.downlink,
      rtt: info.rtt,
      saveData: info.saveData
    })
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnlineTime(Date.now())
      setReconnectAttempts(0)
      updateNetworkInfo()
      
      logger.info('🟢 Conexión restaurada', {
        reconnectAttempts_: reconnectAttempts,
        offlineTime: lastOnlineTime ? Date.now() - lastOnlineTime : 0
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      setReconnectAttempts(prev => prev + 1)
      
      logger.warn('🔴 Conexión perdida', {
        lastOnlineTime: lastOnlineTime ? lastOnlineTime.toString() : 'unknown',
        attempts: reconnectAttempts + 1
      })
    }

    const handleConnectionChange = () => {
      updateNetworkInfo()
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Network info change listeners
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection

    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    // Initial network info
    updateNetworkInfo()

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [reconnectAttempts, lastOnlineTime, logger])

  // Calculate derived values
  const isSlowConnection = networkInfo.effectiveType === 'slow-2g' || 
                          networkInfo.effectiveType === '2g' ||
                          (networkInfo.downlink > 0 && networkInfo.downlink < 1.5)

  const timeSinceLastOnline = lastOnlineTime ? Date.now() - lastOnlineTime : null

  return {
    isOnline,
    isSlowConnection,
    effectiveType: networkInfo.effectiveType,
    downlink: networkInfo.downlink,
    rtt: networkInfo.rtt,
    saveData: networkInfo.saveData,
    reconnectAttempts,
    lastOnlineTime,
    timeSinceLastOnline
  }
}