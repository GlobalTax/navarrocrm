
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Euro, TrendingUp } from 'lucide-react'
import { useRevenueMetrics } from '@/hooks/useRevenueMetrics'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export const FinancialTab = () => {
  const { metrics, summary } = useRevenueMetrics()

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  const chartData = metrics.slice(0, 6).map(metric => ({
    month: new Date(metric.metric_date).toLocaleDateString('es-ES', { month: 'short' }),
    revenue: metric.total_revenue
  })).reverse()

  const chartConfig = {
    revenue: {
      label: 'Ingresos',
      color: '#3b82f6'
    }
  }

  const topClients = [
    { name: 'Constructora ABC', amount: 3500 },
    { name: 'Inmobiliaria DEF', amount: 2800 },
    { name: 'Servicios GHI', amount: 2100 }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Ingresos por Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Euro className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No hay datos de ingresos disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Facturación por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <span className="font-medium text-slate-900">{client.name}</span>
                <span className="text-slate-700 font-semibold">{formatCurrency(client.amount)}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Total Facturado:</span>
              <span className="font-semibold">{formatCurrency(summary.totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 mt-1">
              <span>Tasa Conversión:</span>
              <span className="font-semibold">{summary.averageConversionRate.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
