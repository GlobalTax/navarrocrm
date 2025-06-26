
import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/usePWA'
import { 
  WifiOff, 
  Download,
  RefreshCw,
  X
} from 'lucide-react'

interface PWASimpleStatusIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export const PWASimpleStatusIndicator: React.FC<PWASimpleStatusIndicatorProps> = ({
  position = 'top-right'
}) => {
  const { 
    isOnline, 
    isUpdateAvailable,
    updatePWA
  } = usePWA()
  
  const [showOffline, setShowOffline] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    setShowOffline(!isOnline)
  }, [isOnline])

  useEffect(() => {
    setShowUpdate(isUpdateAvailable)
  }, [isUpdateAvailable])

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'bottom-right': 'bottom-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-left': 'bottom-4 left-4'
    }
    return positions[position]
  }

  const handleUpdateApp = () => {
    updatePWA()
    setShowUpdate(false)
  }

  const handleDismissOffline = () => {
    setShowOffline(false)
  }

  const handleDismissUpdate = () => {
    setShowUpdate(false)
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2`}>
      {/* Indicador de sin conexión */}
      {showOffline && (
        <Alert className="w-80 bg-orange-50 border-orange-200 shadow-lg">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <div className="font-medium text-orange-800">Sin conexión</div>
              <div className="text-sm text-orange-700">
                Los cambios se guardarán automáticamente
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissOffline}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Notificación de actualización */}
      {showUpdate && (
        <Alert className="w-80 bg-blue-50 border-blue-200 shadow-lg">
          <Download className="h-4 w-4 text-blue-600" />
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium text-blue-800">Nueva versión disponible</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissUpdate}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleUpdateApp}
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Actualizar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
