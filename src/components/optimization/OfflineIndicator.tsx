
import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  AlertTriangle, 
  RefreshCw,
  Clock
} from 'lucide-react'
import { useNetworkStatus } from '@/hooks/performance/useNetworkStatus'

interface OfflineIndicatorProps {
  className?: string
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const { 
    networkInfo, 
    isSlowConnection, 
    getConnectionQuality, 
    updateNetworkInfo 
  } = useNetworkStatus()

  const connectionQuality = getConnectionQuality()
  const isSlowConn = isSlowConnection()

  const getQualityColor = (quality: string): string => {
    const colorMap: Record<string, string> = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500', 
      fair: 'bg-yellow-500',
      poor: 'bg-red-500'
    }
    return colorMap[quality] || 'bg-gray-500'
  }

  const getQualityLabel = (quality: string): string => {
    const labelMap: Record<string, string> = {
      excellent: 'Excelente',
      good: 'Buena',
      fair: 'Regular', 
      poor: 'Pobre'
    }
    return labelMap[quality] || 'Desconocida'
  }

  const formatTimeSinceLastOnline = (timestamp: number | null): string => {
    if (!timestamp) return 'Nunca'
    
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Menos de 1 minuto'
    if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''}`
    
    const hours = Math.floor(minutes / 60)
    return `${hours} hora${hours > 1 ? 's' : ''}`
  }

  // Don't render if online and connection is good
  if (networkInfo.isOnline && !isSlowConn && connectionQuality !== 'poor') {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Offline Alert */}
      {!networkInfo.isOnline && (
        <Alert className="border-red-200 bg-red-50">
          <WifiOff className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-800">Sin conexión a internet</p>
                <p className="text-sm text-red-600">
                  Trabajando en modo offline. Los cambios se sincronizarán automáticamente.
                </p>
                {networkInfo.timeSinceLastOnline && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                    <Clock className="h-3 w-3" />
                    <span>Desconectado hace: {formatTimeSinceLastOnline(networkInfo.timeSinceLastOnline)}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="destructive">
                  Offline
                </Badge>
                {networkInfo.reconnectAttempts > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Intentos: {networkInfo.reconnectAttempts}
                  </Badge>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Slow Connection Alert */}
      {networkInfo.isOnline && isSlowConn && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Signal className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-800">Conexión lenta detectada</p>
                <p className="text-sm text-yellow-600">
                  La aplicación puede funcionar más lentamente de lo normal.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-yellow-700">
                  <span>Tipo: {networkInfo.effectiveType}</span>
                  <span>Velocidad: {networkInfo.downlink} Mbps</span>
                  <span>Latencia: {networkInfo.rtt}ms</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getQualityColor(connectionQuality)}`}></div>
                  <Badge variant="secondary">
                    {getQualityLabel(connectionQuality)}
                  </Badge>
                </div>
                {networkInfo.saveData && (
                  <Badge variant="outline" className="text-xs">
                    Ahorro de datos
                  </Badge>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Poor Connection Warning */}
      {networkInfo.isOnline && connectionQuality === 'poor' && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-orange-800">Calidad de conexión pobre</p>
                <p className="text-sm text-orange-600">
                  Se recomienda esperar a una mejor conexión para operaciones importantes.
                </p>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={updateNetworkInfo}
                    className="text-orange-700 border-orange-300 hover:bg-orange-100"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Verificar conexión
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-orange-600" />
                <Badge variant="destructive">
                  Conexión Pobre
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default OfflineIndicator
