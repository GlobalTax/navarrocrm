
import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  queryKey?: string[]
  fallback?: ReactNode
  onRetry?: () => void
  retryDelay?: number
}

interface State {
  hasError: boolean
  error?: Error
  isNetworkError: boolean
  retryCount: number
  isRetrying: boolean
}

export class QueryErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      isNetworkError: false,
      retryCount: 0,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isNetworkError = 
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to load') ||
      error.name === 'NetworkError' ||
      error.message.includes('ERR_NETWORK')

    return { 
      hasError: true, 
      error,
      isNetworkError
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const queryKey = this.props.queryKey?.join(',') || 'Unknown Query'
    
    console.error(`🚨 [QueryErrorBoundary] Query Error for ${queryKey}:`, error)
    console.error('Error Info:', errorInfo)

    // Auto-retry for network errors
    if (this.state.isNetworkError && this.state.retryCount < 3) {
      this.startAutoRetry()
    }

    // Show appropriate notification
    if (this.state.isNetworkError) {
      toast.error('Error de conexión detectado', {
        description: `Reintentando automáticamente... (${this.state.retryCount + 1}/3)`,
        duration: 3000
      })
    } else {
      toast.error('Error al cargar datos', {
        description: 'Intenta refrescar la página',
        action: {
          label: 'Reintentar',
          onClick: this.handleManualRetry
        }
      })
    }

    // Log to analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'exception', {
        description: `Query Error: ${queryKey}`,
        fatal: false,
        query_key: queryKey,
        network_error: this.state.isNetworkError
      })
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  startAutoRetry = () => {
    const delay = this.props.retryDelay || Math.pow(2, this.state.retryCount) * 2000 // Exponential backoff
    
    this.setState({ isRetrying: true })
    
    this.retryTimeout = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      })
      
      if (this.props.onRetry) {
        this.props.onRetry()
      }
    }, delay)
  }

  handleManualRetry = () => {
    if (this.state.retryCount >= 5) {
      toast.error('Demasiados intentos. Recarga la página.')
      return
    }

    this.setState({ 
      hasError: false, 
      error: undefined, 
      retryCount: this.state.retryCount + 1,
      isRetrying: false
    })

    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const queryKey = this.props.queryKey?.join(' → ') || 'datos'
      
      return (
        <Card className="border-0.5 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive text-sm">
              {this.state.isNetworkError ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              Error al cargar {queryKey}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {this.state.isNetworkError 
                ? 'Error de conexión. Verificando conexión a internet...'
                : 'Se produjo un error al obtener los datos.'
              }
            </p>
            
            {this.state.isRetrying && (
              <div className="text-xs text-blue-600">
                Reintentando automáticamente...
              </div>
            )}
            
            {this.state.retryCount > 0 && (
              <div className="text-xs text-muted-foreground">
                Intento {this.state.retryCount} de 5
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={this.handleManualRetry}
                disabled={this.state.retryCount >= 5 || this.state.isRetrying}
                className="border-0.5 border-black rounded-[10px] hover-lift"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {this.state.isRetrying ? 'Reintentando...' : 'Reintentar'}
              </Button>
              
              {this.state.isNetworkError && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-0.5 border-black rounded-[10px]"
                >
                  <Wifi className="h-4 w-4 mr-1" />
                  Recargar página
                </Button>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-xs cursor-pointer text-muted-foreground">
                  Ver detalles técnicos
                </summary>
                <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-24">
                  {this.state.error.message}
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
