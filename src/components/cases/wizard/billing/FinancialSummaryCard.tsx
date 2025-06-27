
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplateBilling } from '@/types/templateTypes'

interface FinancialSummaryCardProps {
  billing: TemplateBilling
}

export function FinancialSummaryCard({ billing }: FinancialSummaryCardProps) {
  const totalEstimatedRevenue = billing.method === 'fixed' 
    ? billing.fixed_amount || 0
    : billing.estimated_hours_total * (Object.values(billing.hourly_rates)[0] || 0)

  const totalEstimatedExpenses = billing.typical_expenses.reduce((sum, expense) => sum + expense.estimated_amount, 0)

  return (
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
  )
}
