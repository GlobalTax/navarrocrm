
import React from 'react'
import { PWAStatusIndicator } from './PWAStatusIndicator'
import { PWASyncNotification } from './PWASyncNotification'
import { OfflineIndicator } from './OfflineIndicator'
import { PWAUpdateNotification } from './PWAUpdateNotification'

interface PWAEnhancedStatusManagerProps {
  showStatusIndicator?: boolean
  showSyncNotifications?: boolean
  showOfflineIndicator?: boolean  
  showUpdateNotifications?: boolean
  statusPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  compactMode?: boolean
}

export const PWAEnhancedStatusManager: React.FC<PWAEnhancedStatusManagerProps> = ({
  showStatusIndicator = true,
  showSyncNotifications = true,
  showOfflineIndicator = true,
  showUpdateNotifications = true,
  statusPosition = 'top-right',
  compactMode = false
}) => {
  return (
    <>
      {/* Indicador principal de estado PWA */}
      {showStatusIndicator && (
        <PWAStatusIndicator 
          position={statusPosition}
          compact={compactMode}
        />
      )}

      {/* Notificaciones de sincronización */}
      {showSyncNotifications && <PWASyncNotification />}

      {/* Indicador de modo offline (legacy - mantener por compatibilidad) */}
      {showOfflineIndicator && !showStatusIndicator && <OfflineIndicator />}

      {/* Notificaciones de actualización */}
      {showUpdateNotifications && <PWAUpdateNotification />}
    </>
  )
}
