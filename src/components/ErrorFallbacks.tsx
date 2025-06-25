
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Wifi, Database } from 'lucide-react'

// Fallback genérico para errores menores
export const MinimalErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
      <p className="text-sm text-gray-600 mb-3">Error al cargar el contenido</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  </div>
)

// Fallback para errores de red
export const NetworkErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="min-h-[400px] flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Wifi className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-lg">Problema de conexión</CardTitle>
        <CardDescription>
          No se pudo conectar con el servidor. Verifica tu conexión a internet.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar conexión
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
)

// Fallback para errores de datos
export const DataErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="min-h-[300px] flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-lg">Error de datos</CardTitle>
        <CardDescription>
          No se pudieron cargar los datos solicitados.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar datos
          </Button>
        )}
        <Button onClick={() => window.location.href = '/'} variant="ghost" className="w-full">
          <Home className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>
      </CardContent>
    </Card>
  </div>
)

// HOC para envolver componentes con Error Boundary
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return WithErrorBoundaryComponent
}

// Importar ErrorBoundary
import { ErrorBoundary } from './ErrorBoundary'
