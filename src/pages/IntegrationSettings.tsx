
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { EmailDiagnostics } from '@/components/integrations/EmailDiagnostics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Mail, 
  Calendar,
  Webhook,
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle 
} from 'lucide-react'

const IntegrationSettings = () => {
  const integrations = [
    {
      name: 'Resend (Email)',
      status: 'active',
      description: 'Servicio de envío de emails para invitaciones y notificaciones',
      icon: Mail,
      lastSync: '2025-06-30 18:30:00'
    },
    {
      name: 'Microsoft 365',
      status: 'inactive',
      description: 'Sincronización de calendario y contactos',
      icon: Calendar,
      lastSync: null
    },
    {
      name: 'Quantum Economics',
      status: 'active',
      description: 'Sincronización de cuentas contables desde Quantum',
      icon: Database,
      lastSync: '2025-06-30 19:15:00'
    },
    {
      name: 'Webhooks',
      status: 'active',
      description: 'Notificaciones automáticas a sistemas externos',
      icon: Webhook,
      lastSync: '2025-06-30 17:45:00'
    },
    {
      name: 'eInforma',
      status: 'active',
      description: 'Consulta de datos empresariales',
      icon: Database,
      lastSync: '2025-06-30 16:20:00'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'warning':
        return 'Advertencia'
      case 'inactive':
        return 'Inactivo'
      default:
        return 'Desconocido'
    }
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Configuración de Integraciones"
        description="Gestiona las integraciones y conexiones externas del sistema"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Estado de Integraciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration, index) => {
                  const IconComponent = integration.icon
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{integration.name}</h4>
                            <Badge className={`${getStatusColor(integration.status)} text-xs font-medium border`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(integration.status)}
                                {getStatusLabel(integration.status)}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{integration.description}</p>
                          {integration.lastSync && (
                            <p className="text-xs text-gray-500">
                              Última sincronización: {new Date(integration.lastSync).toLocaleString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailDiagnostics />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Configuración de Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Configuración de Calendario
                </h3>
                <p className="text-gray-600 mb-4">
                  La integración con Microsoft 365 estará disponible próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}

export default IntegrationSettings
