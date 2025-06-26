
import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { X, RefreshCw, CheckCircle, AlertCircle, Upload } from 'lucide-react'

interface SyncOperation {
  id: string
  type: 'upload' | 'download' | 'sync'
  description: string
  progress: number
  status: 'pending' | 'running' | 'completed' | 'error'
}

export const PWASyncNotification = () => {
  const [operations, setOperations] = useState<SyncOperation[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Escuchar eventos de sincronización del Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_STATUS') {
        const { operation, status, progress } = event.data
        
        setOperations(prev => {
          const existing = prev.find(op => op.id === operation.id)
          if (existing) {
            return prev.map(op => 
              op.id === operation.id 
                ? { ...op, status, progress }
                : op
            )
          } else {
            return [...prev, { ...operation, status, progress }]
          }
        })
        
        setIsVisible(true)
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    // Auto-ocultar notificaciones completadas después de 3 segundos
    const completedOperations = operations.filter(op => 
      op.status === 'completed' || op.status === 'error'
    )
    
    if (completedOperations.length > 0) {
      const timer = setTimeout(() => {
        setOperations(prev => 
          prev.filter(op => op.status === 'running' || op.status === 'pending')
        )
        
        if (operations.length === completedOperations.length) {
          setIsVisible(false)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [operations])

  const getOperationIcon = (type: string, status: string) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status === 'error') return <AlertCircle className="h-4 w-4 text-red-600" />
    if (status === 'running') return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
    
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4 text-gray-600" />
      case 'download':
        return <RefreshCw className="h-4 w-4 text-gray-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'running':
        return <Badge variant="secondary">En progreso</Badge>
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>
      default:
        return null
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setOperations([])
  }

  if (!isVisible || operations.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md">
      <Alert className="shadow-lg border-2 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Sincronización</span>
              <Badge variant="outline" className="text-xs">
                {operations.length} operacion{operations.length !== 1 ? 'es' : ''}
              </Badge>
            </div>
            
            <AlertDescription className="space-y-3">
              {operations.map((operation) => (
                <div key={operation.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getOperationIcon(operation.type, operation.status)}
                      <span className="text-sm">{operation.description}</span>
                    </div>
                    {getStatusBadge(operation.status)}
                  </div>
                  
                  {operation.status === 'running' && (
                    <Progress value={operation.progress} className="h-2" />
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cerrar
                </Button>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  )
}
