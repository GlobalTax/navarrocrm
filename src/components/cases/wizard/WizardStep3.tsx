
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WizardFormData } from './types'
import { useClients } from '@/hooks/useClients'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { CheckCircle, FileText, CreditCard, Users, Calendar } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WizardStep3Props {
  formData: WizardFormData
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-gray-700">{children}</span>
}

export function WizardStep3({ formData }: WizardStep3Props) {
  const { clients = [] } = useClients()
  const { practiceAreas = [] } = usePracticeAreas()
  const { users = [] } = useUsers()

  const selectedClient = clients.find(c => c.id === formData.contact_id)
  const selectedPracticeArea = practiceAreas.find(p => p.name === formData.practice_area)
  const responsibleSolicitor = users.find(u => u.id === formData.responsible_solicitor_id)
  const originatingSolicitor = users.find(u => u.id === formData.originating_solicitor_id)

  const getBillingMethodLabel = (method: string) => {
    const labels = {
      hourly: 'Por Horas',
      fixed: 'Tarifa Fija',
      contingency: 'Contingencia',
      retainer: 'Anticipo'
    }
    return labels[method as keyof typeof labels] || method
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Abierto',
      on_hold: 'En Espera',
      closed: 'Cerrado'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>¡Listo para crear!</strong> Revisa la información del expediente antes de confirmar.
        </AlertDescription>
      </Alert>

      {/* Basic information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información del Expediente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Título</Label>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <Label>Estado</Label>
              <Badge className={getStatusColor(formData.status)}>
                {getStatusLabel(formData.status)}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cliente</Label>
              <div className="space-y-1">
                <p className="font-medium">{selectedClient?.name || 'No seleccionado'}</p>
                {selectedClient?.email && (
                  <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                )}
              </div>
            </div>
            <div>
              <Label>Área de Práctica</Label>
              <p className="font-medium">
                {selectedPracticeArea?.name || formData.practice_area || 'Sin especificar'}
              </p>
            </div>
          </div>

          {formData.description && (
            <div>
              <Label>Descripción</Label>
              <p className="text-sm bg-gray-50 p-3 rounded-md">{formData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equipo Asignado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Abogado Responsable</Label>
              <p className="font-medium">
                {responsibleSolicitor?.email || 'Sin asignar'}
              </p>
              {responsibleSolicitor && (
                <Badge variant="outline" className="mt-1">
                  {responsibleSolicitor.role}
                </Badge>
              )}
            </div>
            <div>
              <Label>Abogado Originador</Label>
              <p className="font-medium">
                {originatingSolicitor?.email || 'Sin asignar'}
              </p>
              {originatingSolicitor && (
                <Badge variant="outline" className="mt-1">
                  {originatingSolicitor.role}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Método de Facturación</Label>
              <Badge variant="secondary">
                {getBillingMethodLabel(formData.billing_method || 'hourly')}
              </Badge>
            </div>
            <div>
              <Label>Presupuesto Estimado</Label>
              <p className="font-medium">
                {formData.estimated_budget ? `€${formData.estimated_budget.toLocaleString()}` : 'No especificado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next steps */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Próximos Pasos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Se generará automáticamente un número de expediente
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Se creará la estructura de carpetas para documentos
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Se notificará al equipo asignado
            </li>
            {formData.responsible_solicitor_id && (
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Se enviará invitación de colaboración al abogado responsable
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
