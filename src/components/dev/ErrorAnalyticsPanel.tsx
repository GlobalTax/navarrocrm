
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Bug, Wifi, Code, RefreshCw, Trash2 } from 'lucide-react'
import { useErrorService } from '@/services/errorService'

interface ErrorDisplayData {
  id: string
  type: 'error' | 'network' | 'auth' | 'permission'
  message: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  stack?: string
  url: string
}

export const ErrorAnalyticsPanel = () => {
  const [errors, setErrors] = useState<ErrorDisplayData[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const { getStoredErrors, clearStoredErrors } = useErrorService()

  const loadErrors = () => {
    const storedErrors = getStoredErrors()
    const formattedErrors: ErrorDisplayData[] = storedErrors.map(error => ({
      id: `${error.timestamp}-${Math.random()}`,
      type: determineErrorType(error.message),
      message: error.message,
      timestamp: error.timestamp,
      severity: error.severity,
      stack: error.stack,
      url: error.url
    }))
    
    setErrors(formattedErrors.slice(0, 10)) // Mostrar solo los últimos 10
  }

  const determineErrorType = (message: string): ErrorDisplayData['type'] => {
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('fetch') || lowerMessage.includes('network')) return 'network'
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) return 'auth'
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) return 'permission'
    return 'error'
  }

  const getSeverityColor = (severity: ErrorDisplayData['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: ErrorDisplayData['type']) => {
    switch (type) {
      case 'error': return <Bug className="h-3 w-3" />
      case 'network': return <Wifi className="h-3 w-3" />
      case 'auth': return <AlertTriangle className="h-3 w-3" />
      case 'permission': return <Code className="h-3 w-3" />
      default: return <AlertTriangle className="h-3 w-3" />
    }
  }

  const handleClearErrors = () => {
    clearStoredErrors()
    setErrors([])
    setRefreshKey(prev => prev + 1)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })
  }

  useEffect(() => {
    loadErrors()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadErrors, 30000)
    return () => clearInterval(interval)
  }, [refreshKey])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const criticalErrors = errors.filter(e => e.severity === 'critical').length
  const recentErrors = errors.filter(e => 
    Date.now() - new Date(e.timestamp).getTime() < 5 * 60 * 1000
  ).length

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Error Analytics
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  loadErrors()
                  setRefreshKey(prev => prev + 1)
                }}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearErrors}
                className="h-6 w-6 p-0 text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Monitoreo de errores en tiempo real
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span>Total:</span>
              <Badge variant="outline">{errors.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Críticos:</span>
              <Badge variant={criticalErrors > 0 ? "destructive" : "outline"}>
                {criticalErrors}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Recientes:</span>
              <Badge variant={recentErrors > 0 ? "secondary" : "outline"}>
                {recentErrors}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Estado:</span>
              <Badge variant={errors.length === 0 ? "default" : "secondary"}>
                {errors.length === 0 ? 'OK' : 'Errors'}
              </Badge>
            </div>
          </div>

          {/* Lista de errores recientes */}
          {errors.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-xs font-medium text-gray-700">Errores Recientes:</h4>
              {errors.slice(0, 5).map((error) => (
                <div key={error.id} className="p-2 border rounded text-xs">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(error.type)}
                      <span className="font-medium truncate flex-1 mr-1">
                        {error.message.length > 30 
                          ? `${error.message.substring(0, 30)}...` 
                          : error.message
                        }
                      </span>
                    </div>
                    <Badge className={`text-xs ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </Badge>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {formatTimestamp(error.timestamp)}
                  </div>
                  {error.stack && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-gray-600 text-xs">
                        Stack trace
                      </summary>
                      <pre className="text-xs mt-1 p-1 bg-gray-100 rounded overflow-auto max-h-20">
                        {error.stack.substring(0, 200)}...
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm">Sin errores</AlertTitle>
              <AlertDescription className="text-xs">
                No se han detectado errores recientes
              </AlertDescription>
            </Alert>
          )}

          {/* Recomendaciones */}
          {criticalErrors > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm">Atención Requerida</AlertTitle>
              <AlertDescription className="text-xs">
                {criticalErrors} error{criticalErrors > 1 ? 'es' : ''} crítico{criticalErrors > 1 ? 's' : ''} detectado{criticalErrors > 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
