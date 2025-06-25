
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Extender la interfaz ServiceWorkerRegistration para incluir sync
interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>
  }
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Detectar si ya está instalado
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    // Event listener para el prompt de instalación
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    // Event listeners para estado de red
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Event listener para después de la instalación
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
    }

    checkInstalled()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) return false

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setInstallPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error al instalar la app:', error)
      return false
    }
  }

  const registerForPushNotifications = async () => {
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
  }

  const requestBackgroundSync = async (tag: string) => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker no soportado')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistrationWithSync
      
      // Verificar si background sync está disponible
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
  }

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    registerForPushNotifications,
    requestBackgroundSync
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
