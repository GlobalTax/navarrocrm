
import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface SyncStatus {
  isVisible: boolean
  type: 'success' | 'error' | 'syncing'
  message: string
}

export const PWASimpleSyncNotification = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isVisible: false,
    type: 'success',
    message: ''
  })

  useEffect(() => {
    // Escuchar eventos de sincronización simplificados
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_STATUS') {
        const { status, message } = event.data
        
        if (status === 'error') {
          setSyncStatus({
            isVisible: true,
            type: 'error',
            message: message || 'Error al sincronizar datos'
          })
        } else if (status === 'syncing') {
          setSyncStatus({
            isVisible: true,
            type: 'syncing',
            message: 'Sincronizando...'
          })
        } else if (status === 'completed') {
          setSyncStatus({
            isVisible: true,
            type: 'success',
            message: 'Datos sincronizados'
          })
        }
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    // Auto-ocultar notificaciones después de 2 segundos
    if (syncStatus.isVisible && syncStatus.type !== 'syncing') {
      const timer = setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, isVisible: false }))
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [syncStatus])

  if (!syncStatus.isVisible) {
    return null
  }

  const getIcon = () => {
    switch (syncStatus.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
    }
  }

  const getBadgeVariant = () => {
    switch (syncStatus.type) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'syncing':
        return 'secondary'
    }
  }

  const getAlertClass = () => {
    switch (syncStatus.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'syncing':
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs">
      <Alert className={`shadow-lg ${getAlertClass()}`}>
        <div className="flex items-center space-x-2">
          {getIcon()}
          <AlertDescription className="flex items-center justify-between flex-1">
            <span className="text-sm">{syncStatus.message}</span>
            <Badge variant={getBadgeVariant()} className="ml-2 text-xs">
              {syncStatus.type === 'syncing' ? 'Sync' : syncStatus.type === 'success' ? 'OK' : 'Error'}
            </Badge>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  )
}
