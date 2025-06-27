
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useBulkTaskOperations } from '@/hooks/tasks/useBulkTaskOperations'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  History, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Eye
} from 'lucide-react'

export const BulkOperationsList = () => {
  const { operations, isLoading } = useBulkTaskOperations()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'failed':
        return 'Fallido'
      case 'processing':
        return 'Procesando'
      default:
        return 'Pendiente'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando historial...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Historial de Operaciones Masivas</h3>
        <p className="text-sm text-gray-600">
          Revisa el estado y resultados de todas las operaciones masivas realizadas
        </p>
      </div>

      {operations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay operaciones registradas
            </h3>
            <p className="text-gray-500">
              Las operaciones masivas que realices aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {operations.map((operation) => {
            const progressPercentage = operation.total_tasks > 0 
              ? Math.round((operation.processed_tasks / operation.total_tasks) * 100)
              : 0

            return (
              <Card key={operation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(operation.status)}
                        <h4 className="font-medium">
                          {operation.operation_data?.operation_name || 
                           `Operación ${operation.operation_type}`}
                        </h4>
                        <Badge className={getStatusColor(operation.status)}>
                          {getStatusText(operation.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-medium">{operation.total_tasks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Procesadas</p>
                          <p className="font-medium text-green-600">{operation.processed_tasks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Fallidas</p>
                          <p className="font-medium text-red-600">{operation.failed_tasks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Progreso</p>
                          <p className="font-medium">{progressPercentage}%</p>
                        </div>
                      </div>

                      {operation.status === 'processing' && (
                        <Progress value={progressPercentage} className="mb-4" />
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Iniciado {formatDistanceToNow(new Date(operation.created_at), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </span>
                        
                        {operation.completed_at && (
                          <span>
                            Completado {formatDistanceToNow(new Date(operation.completed_at), { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </span>
                        )}
                      </div>

                      {operation.failed_tasks > 0 && operation.error_log?.errors && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-800 mb-2">
                            Errores encontrados:
                          </p>
                          <div className="text-xs text-red-700 space-y-1">
                            {operation.error_log.errors.slice(0, 3).map((error: any, index: number) => (
                              <div key={index}>
                                Lote {error.batch}: {error.error}
                              </div>
                            ))}
                            {operation.error_log.errors.length > 3 && (
                              <div className="text-red-600">
                                ... y {operation.error_log.errors.length - 3} errores más
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
