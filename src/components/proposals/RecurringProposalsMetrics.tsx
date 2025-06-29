
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock,
  Users,
  Target
} from 'lucide-react'

interface RecurringProposalsMetricsProps {
  proposals: any[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export const RecurringProposalsMetrics: React.FC<RecurringProposalsMetricsProps> = ({
  proposals
}) => {
  // Calcular métricas
  const activeProposals = proposals.filter(p => p.status === 'won')
  const totalMRR = activeProposals.reduce((sum, p) => {
    const amount = p.retainer_amount || p.total_amount || 0
    switch (p.recurring_frequency) {
      case 'monthly': return sum + amount
      case 'quarterly': return sum + (amount / 3)
      case 'yearly': return sum + (amount / 12)
      default: return sum + amount
    }
  }, 0)
  
  const totalARR = totalMRR * 12
  const totalHours = activeProposals.reduce((sum, p) => sum + (p.included_hours || 0), 0)
  const avgDealSize = activeProposals.length > 0 ? totalMRR / activeProposals.length : 0
  
  // Próximas renovaciones (próximos 30 días)
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const upcomingRenewals = activeProposals.filter(p => {
    if (!p.next_billing_date) return false
    const billingDate = new Date(p.next_billing_date)
    return billingDate <= nextMonth
  }).length

  const metrics = [
    {
      title: 'MRR (Ingresos Recurrentes Mensuales)',
      value: formatCurrency(totalMRR),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Ingresos mensuales garantizados'
    },
    {
      title: 'ARR (Ingresos Recurrentes Anuales)',
      value: formatCurrency(totalARR),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Proyección anual de ingresos'
    },
    {
      title: 'Contratos Activos',
      value: activeProposals.length.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Propuestas ganadas y activas'
    },
    {
      title: 'Horas Incluidas Totales',
      value: `${totalHours}h`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Horas incluidas en contratos activos'
    },
    {
      title: 'Valor Promedio por Contrato',
      value: formatCurrency(avgDealSize),
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'MRR promedio por contrato'
    },
    {
      title: 'Renovaciones Próximas',
      value: upcomingRenewals.toString(),
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Próximos 30 días'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color} mb-1`}>
              {metric.value}
            </div>
            <p className="text-xs text-gray-500">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
