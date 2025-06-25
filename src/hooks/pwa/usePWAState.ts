
import { useState, useEffect } from 'react'
import { ENV_CONFIG } from '@/config/environment'

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

  useEffect(() => {
    // Detectar si la PWA está instalada
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://')
      
      setPwaState(prev => ({ ...prev, isInstalled }))
    }

    // Detectar disponibilidad de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      
      if (ENV_CONFIG.development.enableLogs) {
        console.log('💾 [PWA] Prompt de instalación disponible')
      }
      
      setPwaState(prev => ({ 
        ...prev, 
        isInstallable: true,
        deferredPrompt: e
      }))
    }

    // Detectar cambios de conectividad
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }))
      if (ENV_CONFIG.development.enableLogs) {
        console.log('🌐 [PWA] Conexión restaurada')
      }
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }))
      if (ENV_CONFIG.development.enableLogs) {
        console.log('📱 [PWA] Modo offline activado')
      }
    }

    // Inicializar
    checkInstallation()

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { pwaState, setPwaState }
}
