import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  isNetworkError: boolean
  retryCount: number
}

export class APIBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      isNetworkError: false,
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error: Error): State {
    const isNetworkError = 
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to load') ||
      error.name === 'NetworkError'

    return { 
      hasError: true, 
      error,
      isNetworkError,
      retryCount: 0 
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [APIBoundary] API Error:', error)
    console.error('Error Info:', errorInfo)

    // Show appropriate toast
    if (this.state.isNetworkError) {
      toast.error('Error de conexión. Revisa tu conexión a internet.', {
        action: {
          label: 'Reintentar',
          onClick: this.handleRetry
        }
      })
    } else {
      toast.error('Error en la aplicación. Intenta de nuevo.', {
        action: {
          label: 'Reintentar', 
          onClick: this.handleRetry
        }
      })
    }

    // Log to error tracking
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'exception', {
        description: `API Error: ${error.message}`,
        fatal: false,
        network_error: this.state.isNetworkError
      })
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= 5) {
      toast.error('Demasiados intentos. Recarga la página.')
      return
    }

    this.setState({ 
      hasError: false, 
      error: undefined, 
      retryCount: this.state.retryCount + 1 
    })

    if (this.props.onRetry) {
      this.props.onRetry()
    }

    // Auto-retry for network errors with exponential backoff
    if (this.state.isNetworkError && this.state.retryCount < 3) {
      const delay = Math.pow(2, this.state.retryCount) * 2000 // 2s, 4s, 8s
      
      toast.loading(`Reintentando en ${delay / 1000} segundos...`)
      
      this.retryTimeout = setTimeout(() => {
        this.setState({ hasError: false, error: undefined })
        toast.dismiss()
      }, delay)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert className="border-0.5 border-destructive">
          <div className="flex items-center gap-2">
            {this.state.isNetworkError ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription className="flex-1">
              {this.state.isNetworkError 
                ? 'Error de conexión. Revisa tu internet e intenta de nuevo.'
                : 'Se produjo un error. Intenta recargar la página.'
              }
            </AlertDescription>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={this.handleRetry}
              disabled={this.state.retryCount >= 5}
              className="border-0.5 border-black rounded-[10px]"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reintentar
            </Button>
          </div>
          
          {this.state.retryCount > 2 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Intento {this.state.retryCount} de 5
            </div>
          )}
        </Alert>
      )
    }

    return this.props.children
  }
}