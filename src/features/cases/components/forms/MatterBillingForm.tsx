import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
        <CardDescription>
          Configurar método de facturación y presupuesto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Método de facturación</Label>
          <Select value={billingMethod} onValueChange={onBillingMethodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Por horas</SelectItem>
              <SelectItem value="fixed">Precio fijo</SelectItem>
              <SelectItem value="contingency">Cuota litis</SelectItem>
              <SelectItem value="retainer">Retainer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="budget">Presupuesto estimado (€)</Label>
          <Input
            id="budget"
            type="number"
            value={estimatedBudget || ''}
            onChange={(e) => {
              const value = e.target.value
              onEstimatedBudgetChange(value ? parseFloat(value) : undefined)
            }}
            placeholder="Ej: 5000"
            min="0"
            step="100"
          />
        </div>
      </CardContent>
    </Card>
  )
}