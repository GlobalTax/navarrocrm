
import React from 'react'
import { PWAConnectionIndicator } from './indicators/PWAConnectionIndicator'
import { PWAUpdateIndicator } from './indicators/PWAUpdateIndicator'
import { PWACacheStatsIndicator } from './indicators/PWACacheStatsIndicator'
import { usePWAStatusIndicators } from '@/hooks/pwa/usePWAStatusIndicators'
import { getPositionClasses, type PositionType } from './utils/positionUtils'

interface PWAStatusIndicatorProps {
  position?: PositionType
  compact?: boolean
}

export const PWAStatusIndicator: React.FC<PWAStatusIndicatorProps> = ({
  position = 'top-right',
  compact = false
}) => {
  const {
    showConnected,
    showOffline,
    showUpdate,
    cacheStats,
    isOnline,
    handleUpdateApp,
    handleDismissConnected,
    handleDismissOffline,
    handleDismissUpdate
  } = usePWAStatusIndicators()

  return (
    <div className={`fixed ${getPositionClasses(position)} z-50 space-y-2`}>
      {/* Indicadores de conexión */}
      <PWAConnectionIndicator
        showConnected={showConnected}
        showOffline={showOffline}
        onDismissConnected={handleDismissConnected}
        onDismissOffline={handleDismissOffline}
      />

      {/* Indicador de actualización */}
      <PWAUpdateIndicator
        showUpdate={showUpdate}
        onUpdateApp={handleUpdateApp}
        onDismissUpdate={handleDismissUpdate}
      />

      {/* Estadísticas de cache (solo en modo no compacto) */}
      {!compact && (
        <div className="flex justify-end">
          <PWACacheStatsIndicator
            cacheStats={cacheStats}
            isOnline={isOnline}
          />
        </div>
      )}
    </div>
  )
}
