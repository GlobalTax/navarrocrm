
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator } from 'lucide-react'
import { TemplateBilling } from '@/types/templateTypes'

interface HoursEstimationFormProps {
  billing: TemplateBilling
  onBillingUpdate: (updates: Partial<TemplateBilling>) => void
  errors: Record<string, string>
}

export function HoursEstimationForm({ billing, onBillingUpdate, errors }: HoursEstimationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Estimación de Horas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Horas Totales Estimadas *</Label>
            <Input
              type="number"
              value={billing.estimated_hours_total || ''}
              onChange={(e) => onBillingUpdate({ estimated_hours_total: parseFloat(e.target.value) || 0 })}
              placeholder="40"
              step="0.5"
              className={errors.billing ? 'border-red-500' : ''}
            />
            {errors.billing && <p className="text-sm text-red-500">{errors.billing}</p>}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Distribución Recomendada</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Investigación y análisis:</span>
              <span className="float-right font-medium">25%</span>
            </div>
            <div>
              <span className="text-blue-700">Documentación:</span>
              <span className="float-right font-medium">30%</span>
            </div>
            <div>
              <span className="text-blue-700">Negociación/Gestión:</span>
              <span className="float-right font-medium">25%</span>
            </div>
            <div>
              <span className="text-blue-700">Cierre y seguimiento:</span>
              <span className="float-right font-medium">20%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
