import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

export class LazyComponentBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check for React hook errors and handle gracefully
    const isHookError = error.message.includes('Cannot read properties of null') ||
                       error.message.includes('Invalid hook call') ||
                       error.message.includes('useMemo') ||
                       error.message.includes('useState')
    
    return { 
      hasError: true, 
      error,
      retryCount: isHookError ? 3 : 0 // Skip retries for hook errors
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const componentName = this.props.componentName || 'LazyComponent'
    
    console.error(`🚨 [LazyComponentBoundary] Error in ${componentName}:`, error)
    console.error('Error Info:', errorInfo)
    
    // Special handling for React hook errors
    if (error.message.includes('Cannot read properties of null') ||
        error.message.includes('Invalid hook call')) {
      console.warn('🔧 React hook error detected - this may be due to multiple React copies or corrupted context')
    }

    // Log to error tracking service if available
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'exception', {
        description: `LazyComponent Error: ${error.message}`,
        fatal: false,
        component: componentName
      })
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      retryCount: this.state.retryCount + 1 
    })

    // Call custom retry handler
    if (this.props.onRetry) {
      this.props.onRetry()
    }

    // Auto-retry with exponential backoff (max 3 times)
    if (this.state.retryCount < 3) {
      const delay = Math.pow(2, this.state.retryCount) * 1000 // 1s, 2s, 4s
      
      this.retryTimeout = setTimeout(() => {
        this.setState({ hasError: false, error: undefined })
      }, delay)
    }
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const componentName = this.props.componentName || 'Componente'
      const canRetry = this.state.retryCount < 3

      return (
        <Card className="max-w-lg mx-auto mt-8 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error al cargar {componentName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'Se produjo un error inesperado al cargar este componente.'}
            </p>
            
            {this.state.retryCount > 0 && (
              <p className="text-xs text-amber-600">
                Intento {this.state.retryCount} de 3
              </p>
            )}

            <div className="flex gap-2">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  size="sm"
                  variant="outline"
                  className="border-0.5 border-black rounded-[10px]"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              )}
              
              <Button 
                onClick={this.handleGoHome}
                size="sm"
                className="border-0.5 border-black rounded-[10px] hover-lift"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-xs cursor-pointer text-muted-foreground">
                  Ver detalles técnicos
                </summary>
                <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}