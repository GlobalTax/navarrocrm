
import { useState, useEffect } from 'react'
import { useLogger } from '../useLogger'
import { NetworkInfo } from '@/types/interfaces'

export const useNetworkStatus = () => {
  const logger = useLogger('useNetworkStatus')
  
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    reconnectAttempts: 0,
    timeSinceLastOnline: null
  })

  const updateNetworkInfo = (): void => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    const newNetworkInfo: NetworkInfo = {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
      reconnectAttempts: networkInfo.reconnectAttempts || 0,
      timeSinceLastOnline: networkInfo.timeSinceLastOnline
    }

    setNetworkInfo(newNetworkInfo)
    
    logger.debug('Network status updated', { 
      metadata: newNetworkInfo 
    })
  }

  useEffect(() => {
    updateNetworkInfo()

    const handleOnline = (): void => {
      logger.info('Connection restored')
      updateNetworkInfo()
    }

    const handleOffline = (): void => {
      logger.warn('Connection lost')
      updateNetworkInfo()
    }

    const handleConnectionChange = (): void => {
      logger.info('Connection changed')
      updateNetworkInfo()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [logger])

  const isSlowConnection = (): boolean => {
    return networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g'
  }

  const getConnectionQuality = (): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (!networkInfo.isOnline) return 'poor'
    
    switch (networkInfo.effectiveType) {
      case '4g':
        return 'excellent'
      case '3g':
        return 'good'
      case '2g':
        return 'fair'
      case 'slow-2g':
        return 'poor'
      default:
        return 'fair'
    }
  }

  return {
    networkInfo,
    isOnline: networkInfo.isOnline,
    effectiveType: networkInfo.effectiveType,
    downlink: networkInfo.downlink,
    saveData: networkInfo.saveData,
    reconnectAttempts: networkInfo.reconnectAttempts,
    timeSinceLastOnline: networkInfo.timeSinceLastOnline,
    isSlowConnection,
    getConnectionQuality,
    updateNetworkInfo
  }
}
