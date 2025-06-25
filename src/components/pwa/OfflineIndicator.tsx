
import React, { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/usePWA'
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react'

export const OfflineIndicator = () => {
  const { isOnline, requestBackgroundSync, syncData } = usePWA()
  const [showReconnected, setShowReconnected] = useState(false)
  const [pendingSync, setPendingSync] = useState(false)

  useEffect(() => {
    if (isOnline && !showReconnected) {
      setShowReconnected(true)
      // Sincronizar datos automáticamente cuando se recupera la conexión
      syncData()
      const timer = setTimeout(() => setShowReconnected(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showReconnected, syncData])

  const handleRetry = async () => {
    setPendingSync(true)
    await requestBackgroundSync('manual-retry')
    await syncData()
    setTimeout(() => setPendingSync(false), 1000)
  }

  if (isOnline && !showReconnected) {
    return null
  }

  if (showReconnected) {
    return (
      <Alert className="fixed bottom-4 right-4 w-80 bg-green-50 border-green-200 z-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-green-800">Conectado - Sincronizando datos...</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            En línea
          </Badge>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="fixed bottom-4 right-4 w-80 bg-yellow-50 border-yellow-200 z-50">
      <WifiOff className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-yellow-800">Sin conexión a internet</span>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Offline
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-yellow-700">
            Los datos se sincronizarán automáticamente
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={pendingSync}
            className="h-6 px-2 text-xs"
          >
            {pendingSync ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Wifi className="h-3 w-3" />
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
