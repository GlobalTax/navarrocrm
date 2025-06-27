
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard } from 'lucide-react'
import { TemplateBilling } from '@/types/templateTypes'

interface BillingMethodSelectorProps {
  billing: TemplateBilling
  onBillingUpdate: (updates: Partial<TemplateBilling>) => void
}

const BILLING_METHODS = [
  { id: 'hourly', name: 'Por Horas', description: 'Facturación por tiempo invertido' },
  { id: 'fixed', name: 'Tarifa Fija', description: 'Precio fijo por el expediente completo' },
  { id: 'retainer', name: 'Retainer', description: 'Anticipo con horas incluidas' },
  { id: 'contingency', name: 'Contingencia', description: 'Pago basado en resultado' }
]

export function BillingMethodSelector({ billing, onBillingUpdate }: BillingMethodSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Método de Facturación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {BILLING_METHODS.map((method) => (
            <div
              key={method.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                billing.method === method.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onBillingUpdate({ method: method.id as any })}
            >
              <h4 className="font-medium mb-1">{method.name}</h4>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          ))}
        </div>

        {/* Configuración específica por método */}
        {billing.method === 'fixed' && (
          <div className="space-y-2">
            <Label>Precio Fijo Total</Label>
            <Input
              type="number"
              value={billing.fixed_amount || ''}
              onChange={(e) => onBillingUpdate({ fixed_amount: parseFloat(e.target.value) || 0 })}
              placeholder="5000"
              step="100"
            />
          </div>
        )}

        {billing.method === 'retainer' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Importe del Retainer</Label>
              <Input
                type="number"
                value={billing.retainer_amount || ''}
                onChange={(e) => onBillingUpdate({ retainer_amount: parseFloat(e.target.value) || 0 })}
                placeholder="3000"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Horas Incluidas</Label>
              <Input
                type="number"
                value={billing.estimated_hours_total || ''}
                onChange={(e) => onBillingUpdate({ estimated_hours_total: parseFloat(e.target.value) || 0 })}
                placeholder="20"
                step="0.5"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
