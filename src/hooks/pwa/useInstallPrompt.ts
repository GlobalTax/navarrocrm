
import { useEffect, useRef } from 'react'

export const useInstallPrompt = (setPwaState: (updater: (prev: any) => any) => void) => {
  const deferredPromptRef = useRef<any>(null)

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
  }, [setPwaState])

  return deferredPromptRef
}
