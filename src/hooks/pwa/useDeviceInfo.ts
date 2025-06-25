
import { useCallback } from 'react'

export const useDeviceInfo = (isInstalled: boolean) => {
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
      build: import.meta.env.VITE_BUILD_ID || 'dev',
      environment: import.meta.env.MODE || 'development',
      isPWA: isInstalled,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches
    }
  }, [isInstalled])

  return {
    getDeviceInfo,
    getAppInfo
  }
}
