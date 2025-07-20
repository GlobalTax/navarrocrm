import React from 'react'
import { useNetworkStatus } from '@/hooks/performance/useNetworkStatus'
import { useOfflineSync } from '@/hooks/performance/useOfflineSync'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalLow, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface OfflineIndicatorProps {
  syncHandler?: (operations: any[]) => Promise<any[]>
  className?: string
  compact?: boolean
}

const defaultSyncHandler = async (operations: any[]) => {
  // Default no-op sync handler
  return []
}

export function OfflineIndicator({ 
  syncHandler = defaultSyncHandler,
  className = '',
  compact = false 
}: OfflineIndicatorProps) {
  const { 
    isOnline, 
    isSlowConnection, 
    effectiveType, 
    downlink,
    reconnectAttempts,
    timeSinceLastOnline 
  } = useNetworkStatus()

  const { 
    queueSize, 
    isSync, 
    syncProgress, 
    forcSync,
    getQueueStatus 
  } = useOfflineSync(syncHandler)

  const syncStats = getQueueStatus()

  // Get connection quality icon
  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    if (isSlowConnection) return <SignalLow className="h-4 w-4" />
    if (downlink > 5) return <SignalHigh className="h-4 w-4" />
    return <Signal className="h-4 w-4" />
  }

  // Get connection status text
  const getStatusText = () => {
    if (!isOnline) {
      if (timeSinceLastOnline && timeSinceLastOnline > 60000) {
        const minutes = Math.floor(timeSinceLastOnline / 60000)
        return `Offline hace ${minutes}m`
      }
      return 'Sin conexión'
    }
    
    if (isSlowConnection) return 'Conexión lenta'
    return 'Conectado'
  }

  // Get status color
  const getStatusVariant = () => {
    if (!isOnline) return 'destructive'
    if (isSlowConnection) return 'secondary'
    return 'default'
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={getStatusVariant()} className="border-0.5 border-black rounded-[10px]">
          {getConnectionIcon()}
          <span className="ml-1">{getStatusText()}</span>
        </Badge>
        
        {queueSize > 0 && (
          <Badge variant="outline" className="border-0.5 border-black rounded-[10px]">
            <RefreshCw className="h-3 w-3 mr-1" />
            {queueSize}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className={`border-0.5 border-black rounded-[10px] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getConnectionIcon()}
          Estado de Conexión
        </CardTitle>
        <CardDescription>
          {getStatusText()}
          {effectiveType !== 'unknown' && isOnline && (
            <span className="ml-2 text-xs">({effectiveType})</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Details */}
        {isOnline && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Velocidad:</span>
              <span className="ml-1">{downlink.toFixed(1)} Mbps</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo:</span>
              <span className="ml-1">{effectiveType}</span>
            </div>
          </div>
        )}

        {/* Offline Info */}
        {!isOnline && (
          <div className="space-y-2">
            {reconnectAttempts > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" />
                Intentos de reconexión: {reconnectAttempts}
              </div>
            )}
          </div>
        )}

        {/* Sync Status */}
        {queueSize > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cola de Sincronización</span>
              <Badge variant="outline" className="border-0.5 border-black rounded-[10px]">
                {queueSize} pendientes
              </Badge>
            </div>
            
            {isSync && (
              <div className="space-y-1">
                <Progress value={syncProgress} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  Sincronizando... {Math.round(syncProgress)}%
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-muted-foreground">Pendientes</div>
                <div className="font-medium">{syncStats.pending}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Fallidas</div>
                <div className="font-medium text-destructive">{syncStats.failed}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Completadas</div>
                <div className="font-medium text-green-600">{syncStats.completed}</div>
              </div>
            </div>

            {isOnline && !isSync && (
              <Button 
                onClick={forcSync}
                size="sm"
                variant="outline"
                className="w-full border-0.5 border-black rounded-[10px]"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sincronizar Ahora
              </Button>
            )}
          </div>
        )}

        {/* No pending operations */}
        {queueSize === 0 && isOnline && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-600" />
            Todas las operaciones sincronizadas
          </div>
        )}
      </CardContent>
    </Card>
  )
}