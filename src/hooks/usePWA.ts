
import { usePWAState } from './pwa/usePWAState'
import { useServiceWorker } from './pwa/useServiceWorker'
import { useInstallPrompt } from './pwa/useInstallPrompt'
import { usePWAActions } from './pwa/usePWAActions'
import { useCacheManagement } from './pwa/useCacheManagement'
import { useDeviceInfo } from './pwa/useDeviceInfo'
import { usePWAFileHandlers } from './pwa/usePWAFileHandlers'

export const usePWA = () => {
  const { pwaState, setPwaState } = usePWAState()
  const registrationRef = useServiceWorker(setPwaState)
  const deferredPromptRef = useInstallPrompt(setPwaState)
  
  const {
    installPWA,
    updatePWA,
    checkConnectivity,
    syncData,
    requestBackgroundSync
  } = usePWAActions(deferredPromptRef, registrationRef, setPwaState, pwaState.isOnline)
  
  const { clearCache, getCacheStats } = useCacheManagement()
  const { getDeviceInfo, getAppInfo } = useDeviceInfo(pwaState.isInstalled)
  const { handleFileOpen, handleProtocolAction } = usePWAFileHandlers()

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
    requestBackgroundSync,
    
    // Información
    getDeviceInfo,
    getAppInfo,

    // Funciones legacy (compatibilidad)
    installApp: installPWA,
    isInstallable: pwaState.isInstallable,
    isInstalled: pwaState.isInstalled,
    isOnline: pwaState.isOnline,
    handleFileOpen,
    handleProtocolAction
  }
}

// Re-export push notifications hook
export { usePushNotifications } from './pwa/usePushNotifications'
