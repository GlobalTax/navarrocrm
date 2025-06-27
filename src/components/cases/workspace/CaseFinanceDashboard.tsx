
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Euro, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseFinanceDashboardProps {
  case_: Case
}

export function CaseFinanceDashboard({ case_ }: CaseFinanceDashboardProps) {
  // Mock data - en producción vendría de hooks
  const financialData = {
    estimatedBudget: 5000,
    actualCost: 3250,
    hoursEstimated: 20,
    hoursActual: 18.5,
    billableHours: 16.5,
    hourlyRate: 150,
    expenses: 450,
    totalBilled: 2925,
    pendingInvoices: 1500,
    paidInvoices: 1425,
    profitMargin: 42
  }

  const budgetUsagePercentage = (financialData.actualCost / financialData.estimatedBudget) * 100
  const hoursUsagePercentage = (financialData.hoursActual / financialData.hoursEstimated) * 100
  const totalRevenue = financialData.billableHours * financialData.hourlyRate
  const netProfit = totalRevenue - financialData.actualCost

  const getBudgetStatus = () => {
    if (budgetUsagePercentage > 90) return { color: 'text-red-600', status: 'Crítico' }
    if (budgetUsagePercentage > 75) return { color: 'text-yellow-600', status: 'Alerta' }
    return { color: 'text-green-600', status: 'Saludable' }
  }

  const budgetStatus = getBudgetStatus()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Panel Financiero</h2>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Euro className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  €{totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Ingresos Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  €{netProfit.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Beneficio Neto</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {financialData.billableHours}h
                </div>
                <div className="text-sm text-gray-600">Horas Facturables</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <div className={`text-2xl font-bold ${budgetStatus.color}`}>
                  {budgetUsagePercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Uso Presupuesto</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso de presupuesto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Control de Presupuesto
            <Badge className={`${budgetStatus.color.replace('text-', 'bg-').replace('-600', '-100')} ${budgetStatus.color}`}>
              {budgetStatus.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Presupuesto utilizado</span>
              <span>€{financialData.actualCost.toLocaleString()} / €{financialData.estimatedBudget.toLocaleString()}</span>
            </div>
            <Progress value={budgetUsagePercentage} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Horas utilizadas</span>
              <span>{financialData.hoursActual}h / {financialData.hoursEstimated}h</span>
            </div>
            <Progress value={hoursUsagePercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Desglose financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos y Costos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Horas facturables</span>
                <span className="font-medium">€{(financialData.billableHours * financialData.hourlyRate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos del caso</span>
                <span className="font-medium text-red-600">-€{financialData.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Costos internos</span>
                <span className="font-medium text-red-600">-€{(financialData.actualCost - financialData.expenses).toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold">
                <span>Beneficio neto</span>
                <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  €{netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total facturado</span>
                <span className="font-medium">€{financialData.totalBilled.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Facturas pendientes</span>
                <span className="font-medium text-yellow-600">€{financialData.pendingInvoices.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Facturas pagadas</span>
                <span className="font-medium text-green-600">€{financialData.paidInvoices.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span>Pendiente de facturar</span>
                <span className="font-medium text-blue-600">
                  €{(totalRevenue - financialData.totalBilled).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de rentabilidad */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Rentabilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {financialData.profitMargin}%
              </div>
              <div className="text-sm text-gray-600">Margen de Beneficio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                €{financialData.hourlyRate}
              </div>
              <div className="text-sm text-gray-600">Tarifa Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {(financialData.billableHours / financialData.hoursActual * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Tasa Facturación</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
