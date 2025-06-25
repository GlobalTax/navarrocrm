
import { useCallback } from 'react'

export const usePWAActions = (
  deferredPromptRef: React.MutableRefObject<any>,
  registrationRef: React.MutableRefObject<ServiceWorkerRegistration | null>,
  setPwaState: (updater: (prev: any) => any) => void,
  isOnline: boolean
) => {
  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!deferredPromptRef.current) {
      console.warn('⚠️ [PWA] No hay prompt de instalación disponible')
      return false
    }

    try {
      deferredPromptRef.current.prompt()
      const { outcome } = await deferredPromptRef.current.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ [PWA] Usuario aceptó la instalación')
        setPwaState(prev => ({ 
          ...prev, 
          isInstalled: true,
          isInstallable: false,
          deferredPrompt: null
        }))
        deferredPromptRef.current = null
        return true
      } else {
        console.log('❌ [PWA] Usuario rechazó la instalación')
        return false
      }
    } catch (error) {
      console.error('❌ [PWA] Error durante la instalación:', error)
      return false
    }
  }, [deferredPromptRef, setPwaState])

  // Actualizar PWA
  const updatePWA = useCallback(async () => {
    if (registrationRef.current && registrationRef.current.waiting) {
      registrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      setPwaState(prev => ({ 
        ...prev, 
        isUpdateAvailable: false,
        isUpdateReady: false
      }))
      
      // Recargar la página para aplicar la actualización
      window.location.reload()
    }
  }, [registrationRef, setPwaState])

  // Verificar conectividad
  const checkConnectivity = useCallback(async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      return response.ok
    } catch {
      return false
    }
  }, [])

  // Sincronizar datos cuando vuelve la conexión
  const syncData = useCallback(async () => {
    if (!isOnline) return

    try {
      console.log('🔄 [PWA] Sincronizando datos...')
      
      const pendingData = localStorage.getItem('pendingSync')
      if (pendingData) {
        localStorage.removeItem('pendingSync')
      }
      
      console.log('✅ [PWA] Datos sincronizados')
    } catch (error) {
      console.error('❌ [PWA] Error sincronizando datos:', error)
    }
  }, [isOnline])

  // Background sync
  const requestBackgroundSync = useCallback(async (tag: string) => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker no soportado')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready as any
      
      if (!registration.sync) {
        console.warn('Background sync no soportado')
        return false
      }

      await registration.sync.register(tag)
      return true
    } catch (error) {
      console.error('Error al registrar background sync:', error)
      return false
    }
  }, [])

  return {
    installPWA,
    updatePWA,
    checkConnectivity,
    syncData,
    requestBackgroundSync
  }
}
