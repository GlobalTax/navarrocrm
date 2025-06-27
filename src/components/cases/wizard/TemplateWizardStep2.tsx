
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdvancedTemplateData } from '@/types/templateTypes'
import { CreditCard, Calculator, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface TemplateWizardStep2Props {
  formData: {
    template_data: AdvancedTemplateData
  }
  updateTemplateData: (updates: Partial<AdvancedTemplateData>) => void
  errors: Record<string, string>
}

const BILLING_METHODS = [
  { id: 'hourly', name: 'Por Horas', description: 'Facturación por tiempo invertido' },
  { id: 'fixed', name: 'Tarifa Fija', description: 'Precio fijo por el expediente completo' },
  { id: 'retainer', name: 'Retainer', description: 'Anticipo con horas incluidas' },
  { id: 'contingency', name: 'Contingencia', description: 'Pago basado en resultado' }
]

const EXPENSE_CATEGORIES = [
  'Tasas administrativas',
  'Notarial',
  'Registro',
  'Pericial',
  'Desplazamientos',
  'Documentación',
  'Otros'
]

const USER_ROLES = [
  { id: 'partner', name: 'Partner', rate: 200 },
  { id: 'senior', name: 'Senior', rate: 150 },
  { id: 'junior', name: 'Junior', rate: 100 },
  { id: 'paralegal', name: 'Paralegal', rate: 75 }
]

export function TemplateWizardStep2({ formData, updateTemplateData, errors }: TemplateWizardStep2Props) {
  const [newExpense, setNewExpense] = useState({
    name: '',
    estimated_amount: 0,
    category: EXPENSE_CATEGORIES[0]
  })

  const billing = formData.template_data.billing

  const updateBilling = (updates: Partial<typeof billing>) => {
    updateTemplateData({
      billing: { ...billing, ...updates }
    })
  }

  const handleAddExpense = () => {
    if (newExpense.name.trim() && newExpense.estimated_amount > 0) {
      updateBilling({
        typical_expenses: [
          ...billing.typical_expenses,
          { 
            id: Date.now().toString(),
            ...newExpense 
          }
        ]
      })
      setNewExpense({
        name: '',
        estimated_amount: 0,
        category: EXPENSE_CATEGORIES[0]
      })
    }
  }

  const handleRemoveExpense = (index: number) => {
    const newExpenses = billing.typical_expenses.filter((_, i) => i !== index)
    updateBilling({ typical_expenses: newExpenses })
  }

  const handleRoleRateChange = (role: string, rate: number) => {
    updateBilling({
      hourly_rates: { ...billing.hourly_rates, [role]: rate }
    })
  }

  const totalEstimatedRevenue = billing.method === 'fixed' 
    ? billing.fixed_amount || 0
    : billing.estimated_hours_total * (Object.values(billing.hourly_rates)[0] || 0)

  const totalEstimatedExpenses = billing.typical_expenses.reduce((sum, expense) => sum + expense.estimated_amount, 0)

  return (
    <div className="space-y-6">
      {/* Método de facturación */}
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
                onClick={() => updateBilling({ method: method.id as any })}
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
                onChange={(e) => updateBilling({ fixed_amount: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => updateBilling({ retainer_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="3000"
                  step="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Horas Incluidas</Label>
                <Input
                  type="number"
                  value={billing.estimated_hours_total || ''}
                  onChange={(e) => updateBilling({ estimated_hours_total: parseFloat(e.target.value) || 0 })}
                  placeholder="20"
                  step="0.5"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarifas por rol */}
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

      {/* Estimación de horas */}
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
                onChange={(e) => updateBilling({ estimated_hours_total: parseFloat(e.target.value) || 0 })}
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

      {/* Gastos típicos */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos Típicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {billing.typical_expenses.map((expense, index) => (
              <div key={expense.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{expense.name}</div>
                  <div className="text-sm text-gray-500">{expense.category}</div>
                </div>
                <Badge variant="outline">€{expense.estimated_amount}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExpense(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="col-span-5">
              <Input
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                placeholder="Nombre del gasto..."
              />
            </div>
            <div className="col-span-3">
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                value={newExpense.estimated_amount || ''}
                onChange={(e) => setNewExpense({ ...newExpense, estimated_amount: parseFloat(e.target.value) || 0 })}
                placeholder="€"
                step="10"
              />
            </div>
            <div className="col-span-2">
              <Button onClick={handleAddExpense} className="w-full">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen financiero */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">€{totalEstimatedRevenue.toLocaleString()}</div>
              <div className="text-sm text-green-700">Ingresos Estimados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">€{totalEstimatedExpenses.toLocaleString()}</div>
              <div className="text-sm text-orange-700">Gastos Estimados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">€{(totalEstimatedRevenue - totalEstimatedExpenses).toLocaleString()}</div>
              <div className="text-sm text-blue-700">Beneficio Neto</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
