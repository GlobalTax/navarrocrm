
import { useEffect, useRef } from 'react'

export const useServiceWorker = (setPwaState: (updater: (prev: any) => any) => void) => {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

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
  }, [setPwaState])

  return registrationRef
}
