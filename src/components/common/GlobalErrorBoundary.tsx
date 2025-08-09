import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { globalLogger } from '@/utils/logging'
import * as Sentry from '@sentry/react'

interface ErrorFallbackProps {
  error: Error
  retry: () => void
  canRetry: boolean
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry, canRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 text-destructive mb-4">
          <AlertTriangle className="h-full w-full" />
        </div>
        <CardTitle className="text-destructive">Error en la aplicación</CardTitle>
        <CardDescription>
          Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">Detalles técnicos</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
        
        {canRetry && (
          <Button onClick={retry} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()} 
          className="w-full"
        >
          Recargar página
        </Button>
      </CardContent>
    </Card>
  </div>
)

interface GlobalErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Check for specific chunk/module loading errors
    const isChunkError = error.message?.includes('Loading chunk') || 
                        error.message?.includes('Loading CSS chunk') ||
                        error.message?.includes('module script') ||
                        error.stack?.includes('chunk-')
    
    const isReactError = error.message?.includes('Minified React error')
    
    // Enhanced logging for chunk errors
    if (isChunkError) {
      console.error('🧩 [GlobalErrorBoundary] Chunk loading error detected:', {
        message: error.message,
        isChunkError: true,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }
    
    if (isReactError) {
      console.error('⚛️ [GlobalErrorBoundary] React error detected:', {
        message: error.message,
        isReactError: true,
        url: window.location.href
      })
    }
    
    // Log error using professional logger
    globalLogger.error('Global error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isChunkError,
      isReactError,
      url: window.location.href
    })

    // Report to Sentry for observability
    Sentry.captureException(error, {
      tags: { 
        boundary: 'GlobalErrorBoundary',
        errorType: isChunkError ? 'chunk_loading' : isReactError ? 'react_error' : 'unknown'
      },
      contexts: { 
        react: { componentStack: errorInfo.componentStack },
        app: { url: window.location.href }
      },
    })
  }

  handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: prev.retryCount + 1 
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          retry={this.handleRetry}
          canRetry={this.state.retryCount < 3}
        />
      )
    }

    return this.props.children
  }
}