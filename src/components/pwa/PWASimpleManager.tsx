
import React from 'react'
import { PWASimpleStatusIndicator } from './PWASimpleStatusIndicator'
import { PWASimpleSyncNotification } from './PWASimpleSyncNotification'
import { PWAUpdateNotification } from './PWAUpdateNotification'

interface PWASimpleManagerProps {
  showOfflineIndicator?: boolean
  showSyncNotifications?: boolean
  showUpdateNotifications?: boolean
  statusPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export const PWASimpleManager: React.FC<PWASimpleManagerProps> = ({
  showOfflineIndicator = true,
  showSyncNotifications = true,
  showUpdateNotifications = true,
  statusPosition = 'top-right'
}) => {
  return (
    <>
      {/* Indicador simple de estado PWA - solo offline y actualizaciones */}
      {showOfflineIndicator && (
        <PWASimpleStatusIndicator position={statusPosition} />
      )}

      {/* Notificaciones discretas de sincronización */}
      {showSyncNotifications && <PWASimpleSyncNotification />}

      {/* Notificaciones de actualización (mantener la existente si es necesaria) */}
      {showUpdateNotifications && <PWAUpdateNotification />}
    </>
  )
}
