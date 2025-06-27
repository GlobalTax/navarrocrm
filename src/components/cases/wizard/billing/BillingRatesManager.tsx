
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TemplateBilling } from '@/types/templateTypes'

interface BillingRatesManagerProps {
  billing: TemplateBilling
  onBillingUpdate: (updates: Partial<TemplateBilling>) => void
}

const USER_ROLES = [
  { id: 'partner', name: 'Partner', rate: 200 },
  { id: 'senior', name: 'Senior', rate: 150 },
  { id: 'junior', name: 'Junior', rate: 100 },
  { id: 'paralegal', name: 'Paralegal', rate: 75 }
]

export function BillingRatesManager({ billing, onBillingUpdate }: BillingRatesManagerProps) {
  const handleRoleRateChange = (role: string, rate: number) => {
    onBillingUpdate({
      hourly_rates: { ...billing.hourly_rates, [role]: rate }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarifas por Rol</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {USER_ROLES.map((role) => (
            <div key={role.id} className="space-y-2">
              <Label>{role.name}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={billing.hourly_rates[role.id] || role.rate}
                  onChange={(e) => handleRoleRateChange(role.id, parseFloat(e.target.value) || 0)}
                  placeholder={role.rate.toString()}
                  step="5"
                />
                <span className="text-sm text-gray-500">€/hora</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
