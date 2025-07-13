import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Settings, 
  AlertTriangle,
  Mail,
  Zap
} from 'lucide-react'
import { useOutlookAuth } from '@/hooks/useOutlookAuth'
import { OutlookAuthService, type ConnectionDiagnostic } from '@/services/outlookAuthService'

export function EmailConnectionStatus() {
  const { connectionStatus, isConnecting, error, startConnection, runDiagnostic, checkConnection } = useOutlookAuth()
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostic[]>([])
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-hsl(var(--success))'
      case 'connecting': return 'bg-hsl(var(--warning))'
      case 'error': return 'bg-hsl(var(--destructive))'
      case 'expired': return 'bg-hsl(var(--warning))'
      default: return 'bg-hsl(var(--muted))'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="h-5 w-5 text-hsl(var(--success))" />
      case 'connecting': return <RefreshCw className="h-5 w-5 text-hsl(var(--warning)) animate-spin" />
      case 'error': return <XCircle className="h-5 w-5 text-hsl(var(--destructive))" />
      case 'expired': return <AlertTriangle className="h-5 w-5 text-hsl(var(--warning))" />
      default: return <Clock className="h-5 w-5 text-hsl(var(--muted-foreground))" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado'
      case 'connecting': return 'Conectando...'
      case 'error': return 'Error de conexión'
      case 'expired': return 'Token expirado'
      default: return 'Sin conexión'
    }
  }

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true)
    try {
      const result = await runDiagnostic()
      setDiagnostics(result)
    } catch (error) {
      console.error('Error ejecutando diagnóstico:', error)
    } finally {
      setIsRunningDiagnostic(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Estado Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-hsl(var(--primary))" />
              <div>
                <CardTitle>Conexión de Email</CardTitle>
                <CardDescription>Estado de la integración con Microsoft Outlook</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(connectionStatus)} text-white border-none`}
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon(connectionStatus)}
                <span>{getStatusText(connectionStatus)}</span>
              </div>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-hsl(var(--destructive)) bg-hsl(var(--destructive))/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-hsl(var(--destructive))">
                <div>
                  <p className="font-medium">{error}</p>
                  {error.includes('authorization') && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">💡 Posibles soluciones:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Cerrar sesión y volver a iniciar sesión</li>
                        <li>Verificar que está autenticado correctamente</li>
                        <li>Intentar de nuevo en unos segundos</li>
                        <li>Verificar configuración de Azure AD</li>
                      </ul>
                    </div>
                  )}
                  {error.includes('Missing authorization header') && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">🔧 Error específico: Token de autorización faltante</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Su sesión puede haber expirado</li>
                        <li>Cierre sesión y vuelva a iniciar sesión</li>
                        <li>Verifique su conexión a internet</li>
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-3">
            <Button 
              onClick={startConnection}
              disabled={isConnecting || connectionStatus === 'connecting'}
              className="flex items-center space-x-2"
            >
              {isConnecting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>
                {connectionStatus === 'connected' ? 'Reconectar' : 'Conectar Outlook'}
              </span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleRunDiagnostic}
              disabled={isRunningDiagnostic}
              className="flex items-center space-x-2"
            >
              {isRunningDiagnostic ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              <span>Diagnóstico</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={checkConnection}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Verificar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diagnósticos Detallados */}
      {diagnostics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Diagnóstico de Conexión</span>
            </CardTitle>
            <CardDescription>
              Resultados de las pruebas de conectividad del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnostics.map((diagnostic, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 mt-0.5">
                    {diagnostic.success ? (
                      <CheckCircle2 className="h-5 w-5 text-hsl(var(--success))" />
                    ) : (
                      <XCircle className="h-5 w-5 text-hsl(var(--destructive))" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-hsl(var(--foreground))">
                      {diagnostic.step}
                    </p>
                    <p className={`text-sm ${
                      diagnostic.success 
                        ? 'text-hsl(var(--success))' 
                        : 'text-hsl(var(--destructive))'
                    }`}>
                      {diagnostic.message}
                    </p>
                    {diagnostic.data && (
                      <pre className="mt-2 text-xs bg-hsl(var(--muted)) p-2 rounded overflow-x-auto">
                        {JSON.stringify(diagnostic.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Requerida</CardTitle>
          <CardDescription>
            Pasos para completar la configuración de la integración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-hsl(var(--success))" />
              <span>Aplicación Azure registrada</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-hsl(var(--success))" />
              <span>Client ID configurado</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-hsl(var(--success))" />
              <span>Client Secret configurado</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-hsl(var(--warning))" />
              <span>URI de redirección: https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/outlook-auth</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-hsl(var(--warning))" />
              <span>Permisos requeridos: Mail.Read, Mail.Send, User.Read, offline_access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}