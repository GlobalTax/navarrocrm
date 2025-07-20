import React from 'react'
import { useErrorBoundary } from '@/hooks/useErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: any; retry: () => void }>
  onError?: (error: Error, errorInfo: any) => void
}

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
  { hasError: boolean; error: any; retryCount: number }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.props.onError?.(error, errorInfo)
    
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', { error, errorInfo })
    }
  }

  handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: null,
      retryCount: prev.retryCount + 1 
    }))
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
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