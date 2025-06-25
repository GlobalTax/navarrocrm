
import { useState, useEffect } from 'react'

interface PWAState {
  isInstalled: boolean
  isInstallable: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  isUpdateReady: boolean
  deferredPrompt: any
}

export const usePWAState = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    isUpdateReady: false,
    deferredPrompt: null
  })

  // Detectar si la app está instalada
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true ||
                         document.referrer.includes('android-app://')

      setPwaState(prev => ({ ...prev, isInstalled }))
    }

    checkInstallation()
    window.addEventListener('appinstalled', checkInstallation)
    
    return () => {
      window.removeEventListener('appinstalled', checkInstallation)
    }
  }, [])

  // Detectar conectividad
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    pwaState,
    setPwaState
  }
}
