import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  operationType?: string
  onError?: (error: Error) => void
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  errorDetails?: {
    processed: number
    total: number
    failedItems: any[]
  }
}

export class BulkOperationBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const operationType = this.props.operationType || 'Operación masiva'
    
    console.error(`🚨 [BulkOperationBoundary] Error in ${operationType}:`, error)
    console.error('Error Info:', errorInfo)

    // Extract bulk operation details from error message if available
    let errorDetails
    try {
      if (error.message.includes('BulkError:')) {
        const detailsStr = error.message.split('BulkError:')[1]
        errorDetails = JSON.parse(detailsStr)
      }
    } catch {
      // Ignore JSON parse errors
    }

    this.setState({ errorDetails })

    // Call error handler if provided
    if (this.props.onError) {
      this.props.onError(error)
    }

    // Show specific toast for bulk operations
    toast.error(`Error en ${operationType.toLowerCase()}`, {
      description: errorDetails 
        ? `${errorDetails.processed}/${errorDetails.total} procesados`
        : 'Algunos elementos pueden haberse procesado correctamente',
      action: {
        label: 'Ver detalles',
        onClick: () => this.downloadErrorReport()
      }
    })

    // Log to analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'exception', {
        description: `Bulk Operation Error: ${operationType}`,
        fatal: false,
        operation_type: operationType
      })
    }
  }

  downloadErrorReport = () => {
    if (!this.state.errorDetails) return

    const report = {
      operation: this.props.operationType,
      timestamp: new Date().toISOString(),
      error: this.state.error?.message,
      processed: this.state.errorDetails.processed,
      total: this.state.errorDetails.total,
      failedItems: this.state.errorDetails.failedItems,
      successRate: `${((this.state.errorDetails.processed / this.state.errorDetails.total) * 100).toFixed(1)}%`
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorDetails: undefined })
    
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      const operationType = this.props.operationType || 'Operación masiva'
      const { errorDetails } = this.state
      
      return (
        <Card className="max-w-2xl mx-auto mt-8 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error en {operationType}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message || 'Se produjo un error durante la operación masiva.'}
              </p>
              
              {errorDetails && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progreso al momento del error:</span>
                    <span className="font-medium">
                      {errorDetails.processed} de {errorDetails.total}
                    </span>
                  </div>
                  
                  <Progress 
                    value={(errorDetails.processed / errorDetails.total) * 100} 
                    className="h-2"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded border-0.5 border-green-200">
                      <div className="font-medium text-green-700">{errorDetails.processed}</div>
                      <div className="text-green-600">Procesados</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded border-0.5 border-red-200">
                      <div className="font-medium text-red-700">{errorDetails.failedItems?.length || 0}</div>
                      <div className="text-red-600">Fallidos</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={this.handleRetry}
                size="sm"
                className="border-0.5 border-black rounded-[10px] hover-lift"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar operación
              </Button>
              
              {errorDetails && (
                <Button 
                  onClick={this.downloadErrorReport}
                  size="sm"
                  variant="outline"
                  className="border-0.5 border-black rounded-[10px]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar reporte
                </Button>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-xs cursor-pointer text-muted-foreground">
                  Ver detalles técnicos
                </summary>
                <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-32">
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