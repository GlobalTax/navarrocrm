
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'

interface MatterBillingFormProps {
  billingMethod: string
  estimatedBudget: number | undefined
  onBillingMethodChange: (value: string) => void
  onEstimatedBudgetChange: (value: number | undefined) => void
}

export function MatterBillingForm({
  billingMethod,
  estimatedBudget,
  onBillingMethodChange,
  onEstimatedBudgetChange
}: MatterBillingFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Preferencias de Facturación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Método de Facturación</Label>
            <Select value={billingMethod || 'hourly'} onValueChange={onBillingMethodChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Por Horas</SelectItem>
                <SelectItem value="fixed">Tarifa Fija</SelectItem>
                <SelectItem value="contingency">Contingencia</SelectItem>
                <SelectItem value="retainer">Anticipo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Presupuesto Estimado</Label>
            <Input
              type="number"
              value={estimatedBudget || ''}
              onChange={(e) => onEstimatedBudgetChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
