
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUsers } from '@/hooks/useUsers'
import { WizardFormData } from './types'
import { CreditCard, Users, Lightbulb } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WizardStep2Props {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
  errors: Record<string, string>
}

export function WizardStep2({ formData, updateFormData, errors }: WizardStep2Props) {
  const { users = [] } = useUsers()

  return (
    <div className="space-y-6">
      {/* Team assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignación del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Abogado Responsable</Label>
              <Select 
                value={formData.responsible_solicitor_id || 'none'} 
                onValueChange={(value) => updateFormData({ responsible_solicitor_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar abogado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.role}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Abogado Originador</Label>
              <Select 
                value={formData.originating_solicitor_id || 'none'} 
                onValueChange={(value) => updateFormData({ originating_solicitor_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar abogado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.role}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configuración de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Método de Facturación *</Label>
              <Select 
                value={formData.billing_method || 'hourly'} 
                onValueChange={(value) => updateFormData({ billing_method: value })}
              >
                <SelectTrigger className={errors.billing_method ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">
                    <div className="flex flex-col">
                      <span>Por Horas</span>
                      <span className="text-xs text-muted-foreground">
                        Facturación basada en tiempo invertido
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex flex-col">
                      <span>Tarifa Fija</span>
                      <span className="text-xs text-muted-foreground">
                        Precio fijo acordado previamente
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="contingency">
                    <div className="flex flex-col">
                      <span>Contingencia</span>
                      <span className="text-xs text-muted-foreground">
                        Pago basado en resultado exitoso
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="retainer">
                    <div className="flex flex-col">
                      <span>Anticipo</span>
                      <span className="text-xs text-muted-foreground">
                        Pago por adelantado de servicios
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.billing_method && (
                <p className="text-sm text-red-500">{errors.billing_method}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Presupuesto Estimado (€)</Label>
              <Input
                type="number"
                value={formData.estimated_budget || ''}
                onChange={(e) => updateFormData({ 
                  estimated_budget: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Inicial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => updateFormData({ status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Abierto
                  </div>
                </SelectItem>
                <SelectItem value="on_hold">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    En Espera
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Smart recommendation */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Recomendación:</strong> Para expedientes de {formData.practice_area || 'esta área'}, 
          sugerimos usar facturación por horas con un presupuesto estimado para mejor control de costos.
        </AlertDescription>
      </Alert>
    </div>
  )
}
