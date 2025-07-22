import React from 'react'
import { useErrorBoundary } from '@/hooks/useErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorFallbackProps {
  error: any
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

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  { hasError: boolean; error: any; errorInfo: any; retryCount: number }
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

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo })
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Global Error Boundary:', { error, errorInfo })
      // TODO: Send to monitoring service
    }
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