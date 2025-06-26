
import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, X } from 'lucide-react'

interface PWAConnectionIndicatorProps {
  showConnected: boolean
  showOffline: boolean
  onDismissConnected: () => void
  onDismissOffline: () => void
}

export const PWAConnectionIndicator: React.FC<PWAConnectionIndicatorProps> = ({
  showConnected,
  showOffline,
  onDismissConnected,
  onDismissOffline
}) => {
  return (
    <>
      {/* Indicador de conectado */}
      {showConnected && (
        <Alert className="w-80 bg-green-50 border-green-200 shadow-lg">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-800">Conectado</div>
              <div className="text-sm text-green-700">
                Todos los datos están sincronizados
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismissConnected}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
              onClick={onDismissOffline}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
