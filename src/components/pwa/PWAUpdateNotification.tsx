
import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA' 

export const PWAUpdateNotification = () => {
  const { isUpdateAvailable, isUpdateReady, updatePWA } = usePWA()

  if (!isUpdateAvailable && !isUpdateReady) {
    return null
  }

  const handleUpdate = () => {
    updatePWA()
  }

  return (
    <Alert className="fixed top-4 right-4 w-80 bg-blue-50 border-blue-200 z-50">
      <Download className="h-4 w-4 text-blue-600" />
      <AlertDescription className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {isUpdateReady ? 'Actualización lista' : 'Nueva versión disponible'}
          </span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {isUpdateReady ? 'Lista' : 'Descargando'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-700">
            {isUpdateReady 
              ? 'La nueva versión está lista para instalar' 
              : 'Descargando nueva versión...'}
          </span>
          {isUpdateReady && (
            <Button
              size="sm"
              onClick={handleUpdate}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualizar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
