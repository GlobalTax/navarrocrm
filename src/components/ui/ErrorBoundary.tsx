/**
 * Enhanced Error Boundary with better error handling and reporting
 */

import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { logger } from '@/utils/logging'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Ha ocurrido un error</CardTitle>
        </div>
        <CardDescription>
          Se ha producido un error inesperado. Puedes intentar recargar la página o contactar con soporte si el problema persiste.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDevelopment && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <h4 className="text-sm font-medium mb-2">Detalles del error (modo desarrollo):</h4>
            <pre className="text-xs text-destructive font-mono whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer text-muted-foreground">
                  Ver stack trace
                </summary>
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap mt-2">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button onClick={resetErrorBoundary} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Recargar página
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

export function EnhancedErrorBoundary({ 
  children, 
  fallback = ErrorFallback,
  onError
}: EnhancedErrorBoundaryProps) {
  
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Log error to our logging system
    logger.error('React Error Boundary caught error', error.message, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })
    
    // Call custom error handler if provided
    onError?.(error, errorInfo)
  }

  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
        // Optional: Add any cleanup logic here
        logger.info('Error boundary reset')
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Default export for convenience
export default EnhancedErrorBoundary