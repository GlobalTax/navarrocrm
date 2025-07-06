import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useOutlookConnection } from '@/hooks/useOutlookConnection'

export function EmailSettings() {
  const { 
    connectionStatus, 
    connectionData, 
    connect, 
    isConnecting 
  } = useOutlookConnection()

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          status: 'Conectado',
          message: 'Tu cuenta de Outlook está conectada correctamente'
        }
      case 'connecting':
        return {
          icon: Settings,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          status: 'Conectando',
          message: 'Estableciendo conexión con Microsoft Outlook'
        }
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          status: 'Error',
          message: 'Hay un problema con la conexión. Intenta reconectar.'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          status: 'No conectado',
          message: 'Conecta tu cuenta de Outlook para gestionar emails'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="Configuración de Email"
        description="Gestiona la integración con Microsoft Outlook"
      />

      {/* Estado de conexión */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Integración con Microsoft Outlook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-0.5 rounded-[10px]`}>
            <StatusIcon className={`h-4 w-4 ${statusInfo.color} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Estado:</span>
                    <Badge variant={connectionStatus === 'connected' ? 'default' : 'outline'}>
                      {statusInfo.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {statusInfo.message}
                  </p>
                </div>
                {connectionStatus !== 'connected' && (
                  <Button
                    onClick={connect}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {isConnecting ? 'Conectando...' : 'Conectar Outlook'}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Detalles de conexión */}
          {connectionData && connectionStatus === 'connected' && (
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium">Conectado desde:</span>{' '}
                <span className="text-muted-foreground">
                  {new Date(connectionData.created_at).toLocaleString('es-ES')}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Última actualización:</span>{' '}
                <span className="text-muted-foreground">
                  {new Date(connectionData.updated_at).toLocaleString('es-ES')}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Token expira:</span>{' '}
                <span className="text-muted-foreground">
                  {new Date(connectionData.token_expires_at).toLocaleString('es-ES')}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Permisos:</span>{' '}
                <span className="text-muted-foreground">
                  {connectionData.scope_permissions?.join(', ') || 'Lectura y envío de emails'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle>Información sobre la Integración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <h4 className="font-medium mb-2">¿Qué hace esta integración?</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Sincroniza tus emails de Outlook con el CRM</li>
              <li>• Permite enviar emails desde la plataforma</li>
              <li>• Mantiene un historial de comunicaciones por cliente</li>
              <li>• Automatiza el seguimiento de conversaciones</li>
            </ul>
          </div>
          
          <div className="text-sm">
            <h4 className="font-medium mb-2">Datos que accedemos:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Emails recibidos y enviados</li>
              <li>• Metadatos de mensajes (remitente, destinatario, fecha)</li>
              <li>• Información de contactos relacionados</li>
            </ul>
          </div>

          <div className="text-sm">
            <h4 className="font-medium mb-2">Seguridad:</h4>
            <p className="text-muted-foreground">
              Todos los datos se transfieren de forma segura usando protocolos de cifrado estándar de la industria. 
              Tu información está protegida y solo es accesible por tu organización.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}