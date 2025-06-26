
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target, DollarSign, Users } from 'lucide-react'
import type { Proposal } from '@/hooks/useProposals'

interface DealsMetricsProps {
  deals: Proposal[]
}

export function DealsMetrics({ deals }: DealsMetricsProps) {
  const totalDeals = deals.length
  const wonDeals = deals.filter(deal => deal.status === 'won').length
  const sentDeals = deals.filter(deal => deal.status === 'sent').length
  const totalValue = deals.reduce((sum, deal) => sum + (deal.total_amount || 0), 0)
  const wonValue = deals
    .filter(deal => deal.status === 'won')
    .reduce((sum, deal) => sum + (deal.total_amount || 0), 0)
  
  const conversionRate = sentDeals > 0 ? (wonDeals / sentDeals) * 100 : 0

  const metrics = [
    {
      title: 'Total Deals',
      value: totalDeals.toString(),
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Valor Total',
      value: `€${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Deals Ganados',
      value: `€${wonValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      title: 'Tasa Conversión',
      value: `${conversionRate.toFixed(1)}%`,
      icon: Users,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.title === 'Tasa Conversión' && (
                <Badge variant="outline" className="mt-2">
                  {wonDeals} de {sentDeals} enviados
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
