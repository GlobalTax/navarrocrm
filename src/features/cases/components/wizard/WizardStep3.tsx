import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useClients } from '@/hooks/useClients'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { WizardFormData } from './types'

interface WizardStep3Props {
  formData: WizardFormData
}

function Label({ children }: { children: React.ReactNode }) {
  return <dt className="text-sm font-medium text-gray-600">{children}</dt>
}

export function WizardStep3({ formData }: WizardStep3Props) {
  const { clients } = useClients()
  const { practiceAreas } = usePracticeAreas()
  const { users } = useUsers()

  const selectedClient = clients.find(c => c.id === formData.contact_id)
  const selectedPracticeArea = practiceAreas.find(p => p.name === formData.practice_area)
  const responsibleSolicitor = users.find(u => u.id === formData.responsible_solicitor_id)
  const originatingSolicitor = users.find(u => u.id === formData.originating_solicitor_id)

  const getBillingMethodLabel = (method: string) => {
    switch (method) {
      case 'hourly': return 'Por horas'
      case 'fixed': return 'Precio fijo'
      case 'contingency': return 'Cuota litis'
      case 'retainer': return 'Retainer'
      default: return method
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto'
      case 'on_hold': return 'En espera'
      case 'closed': return 'Cerrado'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Resumen del Expediente
        </h3>
        <p className="text-sm text-gray-600">
          Revisa la información antes de crear el expediente
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información Básica</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <Label>Título</Label>
                <dd className="text-sm text-gray-900 mt-1">{formData.title}</dd>
              </div>
              
              <div>
                <Label>Estado</Label>
                <dd className="mt-1">
                  <Badge className={getStatusColor(formData.status)}>
                    {getStatusLabel(formData.status)}
                  </Badge>
                </dd>
              </div>

              <div>
                <Label>Cliente</Label>
                <dd className="text-sm text-gray-900 mt-1">
                  {selectedClient?.name || 'Sin seleccionar'}
                </dd>
              </div>

              <div>
                <Label>Área de práctica</Label>
                <dd className="text-sm text-gray-900 mt-1">
                  {formData.practice_area || 'Sin especificar'}
                </dd>
              </div>

              {formData.description && (
                <div>
                  <Label>Descripción</Label>
                  <dd className="text-sm text-gray-900 mt-1">{formData.description}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipo Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <Label>Asesor responsable</Label>
                <dd className="text-sm text-gray-900 mt-1">
                  {responsibleSolicitor?.email || 'Sin asignar'}
                </dd>
              </div>

              {originatingSolicitor && (
                <div>
                  <Label>Asesor originador</Label>
                  <dd className="text-sm text-gray-900 mt-1">
                    {originatingSolicitor.email}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración de Facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <Label>Método de facturación</Label>
                <dd className="text-sm text-gray-900 mt-1">
                  {getBillingMethodLabel(formData.billing_method)}
                </dd>
              </div>

              {formData.estimated_budget && (
                <div>
                  <Label>Presupuesto estimado</Label>
                  <dd className="text-sm text-gray-900 mt-1">
                    €{formData.estimated_budget.toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximos Pasos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Se creará el expediente en el sistema</li>
              <li>• Se notificará al equipo asignado</li>
              <li>• Se habilitará el registro de tiempo</li>
              <li>• Se configurará el portal cliente</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}