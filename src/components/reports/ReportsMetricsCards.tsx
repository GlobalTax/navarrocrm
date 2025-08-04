
import { Card, CardContent } from '@/components/ui/card'
import { Euro, Clock, TrendingUp, Calendar } from 'lucide-react'
import { useRevenueMetrics } from '@/hooks/useRevenueMetrics'
import { useTimeTrackingMetrics } from '@/hooks/useTimeTrackingMetrics'
import { useRecurringRevenue } from '@/features/billing'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  trend?: string
}

const MetricCard = ({ title, value, subtitle, icon, trend }: MetricCardProps) => (
  <Card className="border-slate-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
    <CardContent className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {trend && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {trend}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export const ReportsMetricsCards = () => {
  const { summary: revenueData } = useRevenueMetrics()
  const { overallMetrics } = useTimeTrackingMetrics('month')
  const { currentMetrics } = useRecurringRevenue()

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Ingresos del Mes"
        value={formatCurrency(revenueData.totalRevenue)}
        subtitle={`${revenueData.totalProposalsWon} propuestas ganadas`}
        icon={<Euro className="h-5 w-5 text-green-600" />}
        trend="+12%"
      />
      
      <MetricCard
        title="Horas Facturadas"
        value={overallMetrics.billableHours}
        subtitle={`${overallMetrics.totalEntries} registros`}
        icon={<Clock className="h-5 w-5 text-blue-600" />}
        trend="+8%"
      />
      
      <MetricCard
        title="Utilización"
        value={`${overallMetrics.utilizationRate}%`}
        subtitle="Productividad del equipo"
        icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
      />
      
      <MetricCard
        title="MRR"
        value={formatCurrency(currentMetrics.monthly_recurring_revenue)}
        subtitle={`${currentMetrics.active_subscriptions} suscripciones`}
        icon={<Calendar className="h-5 w-5 text-purple-600" />}
      />
    </div>
  )
}
