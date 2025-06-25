
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProposalMetricsCalculated } from '@/hooks/useProposalMetricsCalculated'
import { TrendingUp, FileText, CheckCircle, XCircle, Euro, Target, Repeat, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Proposal } from '@/types/proposals'

interface ProposalMetricsProps {
  proposals: Proposal[]
  isLoading?: boolean
}

export function ProposalMetrics({ proposals, isLoading }: ProposalMetricsProps) {
  const metrics = useProposalMetricsCalculated(proposals)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metricsData = [
    {
      title: "Revenue Total",
      value: metrics.totalRevenue,
      format: "currency",
      icon: Euro,
      description: "Ingresos generados",
      color: "text-green-600"
    },
    {
      title: "Propuestas Enviadas",
      value: metrics.totalProposalsSent,
      format: "number",
      icon: FileText,
      description: "Total enviadas",
      color: "text-blue-600"
    },
    {
      title: "Propuestas Ganadas",
      value: metrics.totalProposalsWon,
      format: "number",
      icon: CheckCircle,
      description: "Propuestas aceptadas",
      color: "text-green-600"
    },
    {
      title: "Propuestas Perdidas",
      value: metrics.totalProposalsLost,
      format: "number",
      icon: XCircle,
      description: "Propuestas rechazadas",
      color: "text-red-600"
    },
    {
      title: "Tasa de Conversión",
      value: metrics.averageConversionRate,
      format: "percentage",
      icon: Target,
      description: "% de éxito promedio",
      color: "text-purple-600"
    },
    {
      title: "Valor Promedio",
      value: metrics.averageDealSize,
      format: "currency",
      icon: TrendingUp,
      description: "Por propuesta ganada",
      color: "text-orange-600"
    },
    {
      title: "Revenue Recurrente",
      value: metrics.recurringRevenue,
      format: "currency",
      icon: Repeat,
      description: "De servicios continuos",
      color: "text-blue-600"
    },
    {
      title: "Propuestas Pendientes",
      value: metrics.pendingProposals,
      format: "number",
      icon: Clock,
      description: "En negociación",
      color: "text-yellow-600"
    }
  ]

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `€${value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {metricsData.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {formatValue(metric.value, metric.format)}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
