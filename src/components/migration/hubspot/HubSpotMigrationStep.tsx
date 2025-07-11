import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Loader2, AlertTriangle, Download, Zap } from 'lucide-react'

interface MigrationLog {
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  batch?: number
  processed?: number
}

interface HubSpotMigrationStepProps {
  isRunning: boolean
  progress: number
  currentBatch: number
  totalBatches: number
  successCount: number
  errorCount: number
  estimatedTimeRemaining: number
  migrationLogs: MigrationLog[]
  onCancel?: () => void
}

export function HubSpotMigrationStep({
  isRunning,
  progress,
  currentBatch,
  totalBatches,
  successCount,
  errorCount,
  estimatedTimeRemaining,
  migrationLogs,
  onCancel
}: HubSpotMigrationStepProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
        // Calcular velocidad (registros por segundo)
        if (timeElapsed > 0) {
          setCurrentSpeed(Math.round(successCount / timeElapsed))
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeElapsed, successCount])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = () => {
    if (errorCount > 0) return 'border-amber-300 bg-amber-50'
    if (progress === 100) return 'border-green-300 bg-green-50'
    if (isRunning) return 'border-blue-300 bg-blue-50'
    return 'border-gray-300'
  }

  const getLogIcon = (type: MigrationLog['type']) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card className={`border-0.5 rounded-[10px] ${getStatusColor()}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRunning ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : progress === 100 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Zap className="h-5 w-5 text-gray-600" />
              )}
              Proceso de Migración
            </div>
            <Badge variant={isRunning ? 'default' : progress === 100 ? 'default' : 'secondary'}>
              {isRunning ? 'Ejecutando' : progress === 100 ? 'Completado' : 'Detenido'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso total</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Batch Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Lote actual</span>
                <span>{currentBatch} de {totalBatches}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(currentBatch / totalBatches) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-xs text-muted-foreground">Procesados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-xs text-muted-foreground">Errores</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{currentSpeed}</p>
                <p className="text-xs text-muted-foreground">reg/seg</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</p>
                <p className="text-xs text-muted-foreground">Transcurrido</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Estimation */}
      {isRunning && estimatedTimeRemaining > 0 && (
        <Alert className="border-0.5 border-blue-300 rounded-[10px] bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Tiempo estimado restante: <strong>{formatTime(estimatedTimeRemaining)}</strong></span>
              {onCancel && (
                <button 
                  onClick={onCancel}
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Cancelar migración
                </button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Migration Logs */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📋 Log de Migración
              <Badge variant="outline">{migrationLogs.length} entradas</Badge>
            </span>
            {migrationLogs.length > 0 && (
              <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                <Download className="h-4 w-4" />
                Descargar log
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {migrationLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                El log aparecerá aquí durante la migración...
              </p>
            ) : (
              migrationLogs.slice(-20).reverse().map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded border-l-4 border-l-gray-300 bg-gray-50">
                  <span className="text-sm">{getLogIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{log.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.batch && (
                        <Badge variant="outline" className="text-xs">
                          Lote {log.batch}
                        </Badge>
                      )}
                      {log.processed && (
                        <Badge variant="outline" className="text-xs">
                          {log.processed} proc.
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {migrationLogs.length > 20 && (
              <p className="text-xs text-center text-muted-foreground py-2">
                Mostrando últimas 20 entradas de {migrationLogs.length} total
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Results */}
      {progress === 100 && (
        <Card className="border-0.5 border-green-300 bg-green-50 rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Migración Completada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contactos importados</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Errores encontrados</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-sm">
                  ✅ Migración desde HubSpot completada en {formatTime(timeElapsed)}
                </p>
                {errorCount > 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Revisa el log para detalles sobre los errores encontrados
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}