
import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, X } from 'lucide-react'

interface PWAUpdateIndicatorProps {
  showUpdate: boolean
  onUpdateApp: () => void
  onDismissUpdate: () => void
}

export const PWAUpdateIndicator: React.FC<PWAUpdateIndicatorProps> = ({
  showUpdate,
  onUpdateApp,
  onDismissUpdate
}) => {
  if (!showUpdate) return null

  return (
    <Alert className="w-80 bg-blue-50 border-blue-200 shadow-lg">
      <Download className="h-4 w-4 text-blue-600" />
      <AlertDescription className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-blue-800">Nueva versión disponible</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismissUpdate}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={onUpdateApp}
            className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualizar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
