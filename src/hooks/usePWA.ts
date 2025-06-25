
import { useState, useEffect, useCallback, useRef } from 'react'

interface PWAState {
  isInstalled: boolean
  isInstallable: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  isUpdateReady: boolean
  deferredPrompt: any
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    isUpdateReady: false,
    deferredPrompt: null
  })

  const deferredPromptRef = useRef<any>(null)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

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

  // Registrar Service Worker
  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          registrationRef.current = registration

          // Detectar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({ ...prev, isUpdateAvailable: true }))
                }
              })
            }
          })

          // Detectar cuando la actualización está lista
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            setPwaState(prev => ({ 
              ...prev, 
              isUpdateAvailable: false, 
              isUpdateReady: true 
            }))
          })

          console.log('✅ [PWA] Service Worker registrado:', registration)
        } catch (error) {
          console.error('❌ [PWA] Error registrando Service Worker:', error)
        }
      }
    }

    registerSW()
  }, [])

  // Capturar prompt de instalación
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      deferredPromptRef.current = event
      
      setPwaState(prev => ({ 
        ...prev, 
        isInstallable: true,
        deferredPrompt: event
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

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
  }, [])

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
  }, [])

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
    if (!pwaState.isOnline) return

    try {
      // Aquí implementarías la lógica de sincronización
      console.log('🔄 [PWA] Sincronizando datos...')
      
      // Ejemplo: sincronizar datos pendientes
      const pendingData = localStorage.getItem('pendingSync')
      if (pendingData) {
        // Enviar datos pendientes al servidor
        // await sendPendingData(JSON.parse(pendingData))
        localStorage.removeItem('pendingSync')
      }
      
      console.log('✅ [PWA] Datos sincronizados')
    } catch (error) {
      console.error('❌ [PWA] Error sincronizando datos:', error)
    }
  }, [pwaState.isOnline])

  // Obtener información del dispositivo
  const getDeviceInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  }, [])

  // Obtener información de la app
  const getAppInfo = useCallback(() => {
    return {
      name: 'CRM Asesoría',
      version: '1.0.0',
      build: process.env.REACT_APP_BUILD_ID || 'dev',
      environment: process.env.NODE_ENV,
      isPWA: pwaState.isInstalled,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches
    }
  }, [pwaState.isInstalled])

  // Limpiar cache
  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        console.log('✅ [PWA] Cache limpiado')
        return true
      } catch (error) {
        console.error('❌ [PWA] Error limpiando cache:', error)
        return false
      }
    }
    return false
  }, [])

  // Obtener estadísticas de cache
  const getCacheStats = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        const stats = await Promise.all(
          cacheNames.map(async (cacheName) => {
            const cache = await caches.open(cacheName)
            const keys = await cache.keys()
            return {
              name: cacheName,
              size: keys.length,
              sizeInBytes: 0 // Esto requeriría calcular el tamaño real
            }
          })
        )
        return stats
      } catch (error) {
        console.error('❌ [PWA] Error obteniendo estadísticas de cache:', error)
        return []
      }
    }
    return []
  }, [])

  // Funciones legacy para compatibilidad
  const installApp = installPWA
  const isInstallable = pwaState.isInstallable
  const isInstalled = pwaState.isInstalled
  const isOnline = pwaState.isOnline

  // Funciones simplificadas para manejar archivos y protocolos
  const handleFileOpen = useCallback((files: FileList) => {
    console.log('Files opened via PWA:', files)
    const fileArray = Array.from(files)
    const uploadUrl = new URL('/upload', window.location.origin)
    window.location.href = uploadUrl.toString()
    return fileArray
  }, [])

  const handleProtocolAction = useCallback((action: string) => {
    console.log('Protocol action:', action)
    const urlParams = new URLSearchParams(action)
    const actionType = urlParams.get('type')
    const entityId = urlParams.get('id')
    
    switch (actionType) {
      case 'client':
        window.location.href = entityId ? `/clients/${entityId}` : '/contacts'
        break
      case 'case':
        window.location.href = entityId ? `/cases/${entityId}` : '/cases'
        break
      case 'proposal':
        window.location.href = entityId ? `/proposals/${entityId}` : '/proposals'
        break
      case 'timer':
        window.location.href = '/time-tracking'
        break
      default:
        window.location.href = '/'
    }
  }, [])

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
    // Estado principal
    ...pwaState,
    
    // Acciones principales
    installPWA,
    updatePWA,
    checkConnectivity,
    syncData,
    clearCache,
    getCacheStats,
    
    // Información
    getDeviceInfo,
    getAppInfo,

    // Funciones legacy (compatibilidad)
    installApp,
    isInstallable,
    isInstalled,
    isOnline,
    handleFileOpen,
    handleProtocolAction,
    requestBackgroundSync
  }
}

// Hook especializado para notificaciones push
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    setPermission(Notification.permission)
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Este navegador no soporta notificaciones')
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications no soportadas')
    }

    const registration = await navigator.serviceWorker.ready
    const existingSubscription = await registration.pushManager.getSubscription()

    if (existingSubscription) {
      setSubscription(existingSubscription)
      return existingSubscription
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    })

    setSubscription(newSubscription)
    return newSubscription
  }, [])

  const unsubscribeFromPush = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe()
      setSubscription(null)
    }
  }, [subscription])

  const registerPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications no soportadas')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      })

      return subscription
    } catch (error) {
      console.error('Error al registrar push notifications:', error)
      return null
    }
  }, [])

  return {
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    registerPushNotifications
  }
}

// Función auxiliar para convertir VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
