
import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  formName?: string
  onDataRecover?: (data: any) => void
  autoSave?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  savedFormData?: any
  retryCount: number
}

export class FormErrorBoundary extends Component<Props, State> {
  private saveInterval?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const formName = this.props.formName || 'Formulario'
    
    console.error(`🚨 [FormErrorBoundary] Error in ${formName}:`, error)
    console.error('Error Info:', errorInfo)

    // Attempt to save form data before crash
    this.attemptDataRecovery()

    // Show user-friendly error message
    toast.error(`Error en ${formName.toLowerCase()}`, {
      description: 'Tus datos se han guardado automáticamente',
      action: {
        label: 'Recuperar datos',
        onClick: this.recoverSavedData
      }
    })

    // Log to analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'exception', {
        description: `Form Error: ${formName}`,
        fatal: false,
        form_name: formName
      })
    }
  }

  componentDidMount() {
    if (this.props.autoSave) {
      this.startAutoSave()
    }
  }

  componentWillUnmount() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval)
    }
  }

  startAutoSave = () => {
    this.saveInterval = setInterval(() => {
      this.saveFormData()
    }, 30000) // Auto-save every 30 seconds
  }

  saveFormData = () => {
    try {
      const formElements = document.querySelectorAll('input, textarea, select')
      const formData: any = {}
      
      formElements.forEach((element: any) => {
        if (element.name && element.value) {
          formData[element.name] = element.value
        }
      })

      if (Object.keys(formData).length > 0) {
        const key = `form_backup_${this.props.formName || 'default'}`
        localStorage.setItem(key, JSON.stringify({
          data: formData,
          timestamp: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.warn('Failed to save form data:', error)
    }
  }

  attemptDataRecovery = () => {
    try {
      const key = `form_backup_${this.props.formName || 'default'}`
      const saved = localStorage.getItem(key)
      
      if (saved) {
        const { data, timestamp } = JSON.parse(saved)
        const saveTime = new Date(timestamp)
        const now = new Date()
        const hoursDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60)
        
        // Only use data saved within last 24 hours
        if (hoursDiff < 24) {
          this.setState({ savedFormData: data })
        }
      }
    } catch (error) {
      console.warn('Failed to recover form data:', error)
    }
  }

  recoverSavedData = () => {
    if (this.state.savedFormData && this.props.onDataRecover) {
      this.props.onDataRecover(this.state.savedFormData)
      toast.success('Datos recuperados exitosamente')
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      retryCount: this.state.retryCount + 1 
    })
  }

  render() {
    if (this.state.hasError) {
      const formName = this.props.formName || 'Formulario'
      const canRetry = this.state.retryCount < 3
      
      return (
        <Card className="max-w-lg mx-auto mt-8 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error en {formName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Se produjo un error mientras usabas el formulario. 
              {this.state.savedFormData ? ' Tus datos han sido guardados automáticamente.' : ''}
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
                  className="border-0.5 border-black rounded-[10px] hover-lift"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              )}
              
              {this.state.savedFormData && (
                <Button 
                  onClick={this.recoverSavedData}
                  size="sm"
                  variant="outline"
                  className="border-0.5 border-black rounded-[10px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Recuperar datos
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
