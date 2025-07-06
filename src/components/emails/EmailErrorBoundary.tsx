import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

export class EmailErrorBoundary extends React.Component<Props, { hasError: boolean; error?: Error }> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Email dashboard error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Alert className="border-0.5 border-black rounded-[10px]">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Error en el Dashboard de Email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ha ocurrido un error al cargar el dashboard. Esto puede deberse a problemas de conectividad o configuración.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined })
                    window.location.reload()
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}