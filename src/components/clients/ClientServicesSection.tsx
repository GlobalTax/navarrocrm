
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useClientServices } from '@/hooks/useClientServices'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Euro,
  TrendingUp,
  Repeat,
  Target
} from 'lucide-react'

interface ClientServicesSectionProps {
  clientId: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'won':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'sent':
      return 'bg-blue-100 text-blue-800'
    case 'lost':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'won':
      return 'Aceptada'
    case 'draft':
      return 'Borrador'
    case 'sent':
      return 'Enviada'
    case 'lost':
      return 'Rechazada'
    default:
      return status
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'won':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'sent':
      return <Clock className="h-4 w-4 text-blue-600" />
    case 'lost':
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return <FileText className="h-4 w-4 text-gray-600" />
  }
}

export const ClientServicesSection = ({ clientId }: ClientServicesSectionProps) => {
  const { services, metrics, isLoading } = useClientServices(clientId)

  if (isLoading) {
    return <div className="animate-pulse">Cargando servicios...</div>
  }

  return (
    <div className="space-y-6">
      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Euro className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              €{metrics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Ingresos Totales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Repeat className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.activeServicesCount}
            </div>
            <div className="text-sm text-gray-600">Servicios Activos</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.completedServicesCount}
            </div>
            <div className="text-sm text-gray-600">Servicios Completados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Tasa Conversión</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Servicios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Servicios ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay servicios registrados para este cliente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(service.status)}
                        <h4 className="font-medium">{service.title}</h4>
                        <Badge className={getStatusColor(service.status)}>
                          {getStatusLabel(service.status)}
                        </Badge>
                        {service.is_recurring && (
                          <Badge variant="outline" className="gap-1">
                            <Repeat className="h-3 w-3" />
                            Recurrente
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          Creada: {new Date(service.created_at).toLocaleDateString()}
                        </span>
                        {service.accepted_at && (
                          <span>
                            Aceptada: {new Date(service.accepted_at).toLocaleDateString()}
                          </span>
                        )}
                        {service.frequency && (
                          <span className="capitalize">
                            Frecuencia: {service.frequency}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        €{service.total_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.proposal_type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
