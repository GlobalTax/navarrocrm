
import React from 'react'
import { useErrorBoundary } from '@/hooks/useErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: any; retry: () => void }>
  onError?: (error: Error, errorInfo: any) => void
  componentName?: string
}

const logger = createLogger('ErrorBoundary')

const DefaultErrorFallback: React.FC<{ error: any; retry: () => void }> = ({ error, retry }) => (
  <Card className="w-full max-w-md mx-auto border-0.5 border-black rounded-[10px]">
    <CardHeader className="text-center">
      <div className="mx-auto h-12 w-12 text-destructive mb-4">
        <AlertTriangle className="h-full w-full" />
      </div>
      <CardTitle className="text-destructive">Error</CardTitle>
      <CardDescription>
        Ha ocurrido un error inesperado.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <Button onClick={retry} className="w-full border-0.5 border-black rounded-[10px]">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reintentar
      </Button>
    </CardContent>
  </Card>
)

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: any; retryCount: number; errorId: string }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      retryCount: 0,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: any) {
    const errorId = crypto.randomUUID()
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidCatch(error: any, errorInfo: any) {
    const { componentName } = this.props
    const contextName = componentName || 'UnknownComponent'
    
    logger.error('🚨 Error capturado por ErrorBoundary', {
      errorId: this.state.errorId,
      componentName: contextName,
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    // Categorizar el error
    let errorCategory = 'unknown'
    if (error.message?.includes('ChunkLoadError') || error.message?.includes('Loading chunk')) {
      errorCategory = 'chunk_load'
    } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      errorCategory = 'network'
    } else if (error.name === 'TypeError') {
      errorCategory = 'type_error'
    } else if (error.name === 'ReferenceError') {
      errorCategory = 'reference_error'
    }

    const structuredError = createError(`Error en ${contextName}`, {
      severity: errorCategory === 'chunk_load' ? 'medium' : 'high',
      userMessage: this.getUserFriendlyMessage(errorCategory),
      technicalMessage: error.message,
      showToast: false // El boundary maneja su propia UI
    })

    // Callback personalizado si existe
    if (this.props.onError) {
      try {
        this.props.onError(error, {
          ...errorInfo,
          errorId: this.state.errorId,
          category: errorCategory,
          retryCount: this.state.retryCount
        })
      } catch (callbackError) {
        logger.error('❌ Error en callback de ErrorBoundary', {
          errorId: this.state.errorId,
          callbackError: callbackError instanceof Error ? callbackError.message : 'Unknown'
        })
      }
    }

    // Analytics si está disponible
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'exception', {
        description: `ErrorBoundary: ${contextName}`,
        fatal: false,
        error_id: this.state.errorId,
        error_category: errorCategory,
        component_name: contextName
      })
    }
  }

  getUserFriendlyMessage = (category: string): string => {
    switch (category) {
      case 'chunk_load':
        return 'Error cargando recursos. Intenta recargar la página.'
      case 'network':
        return 'Error de conexión. Verifica tu internet.'
      case 'type_error':
        return 'Error en la aplicación. Intenta reintentar.'
      case 'reference_error':
        return 'Error de referencia. Recarga la página.'
      default:
        return 'Ha ocurrido un error inesperado.'
    }
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1
    
    logger.info('🔄 Reintentando tras error', {
      errorId: this.state.errorId,
      retryCount: newRetryCount,
      componentName: this.props.componentName || 'Unknown'
    })

    this.setState(prev => ({ 
      hasError: false, 
      error: null,
      retryCount: newRetryCount,
      errorId: crypto.randomUUID()
    }))
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      logger.debug('🎭 Renderizando fallback de ErrorBoundary', {
        errorId: this.state.errorId,
        componentName: this.props.componentName,
        retryCount: this.state.retryCount,
        hasCustomFallback: !!this.props.fallback
      })
      
      return (
        <FallbackComponent
          error={this.state.error}
          retry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}
