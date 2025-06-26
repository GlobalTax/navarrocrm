
import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/usePWA'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'

interface PWAStatusIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  compact?: boolean
}

export const PWAStatusIndicator: React.FC<PWAStatusIndicatorProps> = ({
  position = 'top-right',
  compact = false
}) => {
  const { 
    isOnline, 
    isInstalled, 
    isUpdateAvailable,
    syncData,
    getCacheStats 
  } = usePWA()
  
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [cacheSize, setCacheSize] = useState<number>(0)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const updateCacheStats = async () => {
      try {
        const stats = await getCacheStats()
        const totalSize = stats.reduce((acc, stat) => acc + stat.size, 0)
        setCacheSize(totalSize)
      } catch (error) {
        console.error('Error obteniendo stats de cache:', error)
      }
    }

    updateCacheStats()
    const interval = setInterval(updateCacheStats, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [getCacheStats])

  const handleSync = async () => {
    setSyncStatus('syncing')
    try {
      await syncData()
      setLastSync(new Date())
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (error) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 5000)
    }
  }

  const formatCacheSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'bottom-right': 'bottom-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-left': 'bottom-4 left-4'
    }
    return positions[position]
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-600" />
      default:
        return <Database className="h-3 w-3 text-gray-600" />
    }
  }

  if (compact) {
    return (
      <div className={`fixed ${getPositionClasses()} z-40`}>
        <div className="flex items-center space-x-2">
          {/* Indicador de conectividad */}
          <Badge 
            variant={isOnline ? "default" : "destructive"}
            className="flex items-center space-x-1"
          >
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="text-xs">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </Badge>

          {/* Indicador de actualización */}
          {isUpdateAvailable && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span className="text-xs">Update</span>
            </Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-40`}>
      <Card className="w-80 shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isOnline ? "default" : "destructive"}
                className="flex items-center space-x-1"
              >
                {isOnline ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                <span>{isOnline ? 'Conectado' : 'Sin conexión'}</span>
              </Badge>
              
              {isInstalled && (
                <Badge variant="outline" className="text-xs">
                  PWA Instalada
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isExpanded ? 'rotate-180' : ''} transition-transform`} />
            </Button>
          </div>

          {isExpanded && (
            <div className="space-y-3">
              {/* Estado de sincronización */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSyncStatusIcon()}
                  <span className="text-sm text-gray-600">
                    {syncStatus === 'syncing' && 'Sincronizando...'}
                    {syncStatus === 'success' && 'Sincronizado'}
                    {syncStatus === 'error' && 'Error en sync'}
                    {syncStatus === 'idle' && 'Sincronización'}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncStatus === 'syncing'}
                  className="h-6 px-2 text-xs"
                >
                  Sync
                </Button>
              </div>

              {/* Información de cache */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Database className="h-3 w-3 text-gray-600" />
                  <span className="text-gray-600">Cache:</span>
                </div>
                <span className="font-mono text-xs">
                  {formatCacheSize(cacheSize)}
                </span>
              </div>

              {/* Última sincronización */}
              {lastSync && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-gray-600" />
                    <span className="text-gray-600">Último sync:</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {lastSync.toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Indicador de actualización disponible */}
              {isUpdateAvailable && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Nueva versión disponible
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
