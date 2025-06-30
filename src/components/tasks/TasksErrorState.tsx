
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TasksErrorStateProps {
  error: Error
  onRetry?: () => void
}

export const TasksErrorState = ({ error, onRetry }: TasksErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md mx-auto border-0.5 border-black rounded-[10px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-red-600">Error al cargar tareas</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {error.message || 'Ha ocurrido un error inesperado al cargar las tareas.'}
          </p>
          
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-[10px] border-0.5 border-gray-200">
            <p className="font-medium mb-1">Detalles técnicos:</p>
            <p className="font-mono text-xs break-all">
              {error.message}
            </p>
          </div>

          {onRetry && (
            <Button 
              onClick={onRetry}
              className="border-0.5 border-black rounded-[10px] hover-lift"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
