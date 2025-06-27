
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { TemplateBilling } from '@/types/templateTypes'

interface ExpensesManagerProps {
  billing: TemplateBilling
  onBillingUpdate: (updates: Partial<TemplateBilling>) => void
}

const EXPENSE_CATEGORIES = [
  'Tasas administrativas',
  'Notarial',
  'Registro',
  'Pericial',
  'Desplazamientos',
  'Documentación',
  'Otros'
]

export function ExpensesManager({ billing, onBillingUpdate }: ExpensesManagerProps) {
  const [newExpense, setNewExpense] = useState({
    name: '',
    estimated_amount: 0,
    category: EXPENSE_CATEGORIES[0]
  })

  const handleAddExpense = () => {
    if (newExpense.name.trim() && newExpense.estimated_amount > 0) {
      onBillingUpdate({
        typical_expenses: [
          ...billing.typical_expenses,
          { 
            id: Date.now().toString(),
            name: newExpense.name,
            estimated_amount: newExpense.estimated_amount,
            category: newExpense.category
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
    onBillingUpdate({ typical_expenses: newExpenses })
  }

  return (
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
  )
}
