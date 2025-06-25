
import React from 'react'
import { PWAInstallPrompt } from './PWAInstallPrompt'
import { usePWA } from '@/hooks/usePWA'

interface PWAStatusManagerProps {
  showInstallPrompt?: boolean
  showOfflineStatus?: boolean
  showUpdatePrompt?: boolean
}

export const PWAStatusManager: React.FC<PWAStatusManagerProps> = ({
  showInstallPrompt = true,
  showOfflineStatus = true,
  showUpdatePrompt = true
}) => {
  const { isInstalled, isInstallable } = usePWA()

  // Only render if we need to show something
  if (isInstalled && !showUpdatePrompt && !showOfflineStatus) {
    return null
  }

  return (
    <PWAInstallPrompt
      showOfflineStatus={showOfflineStatus}
      showUpdatePrompt={showUpdatePrompt}
    />
  )
}
