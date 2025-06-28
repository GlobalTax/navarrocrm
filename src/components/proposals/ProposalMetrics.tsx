
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRevenueMetrics } from '@/hooks/useRevenueMetrics'
import { TrendingUp, FileText, CheckCircle, XCircle, Euro, Target } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ProposalMetrics() {
  const { summary, isLoading } = useRevenueMetrics()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
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

  const metrics = [
    {
      title: "Revenue Total",
      value: summary.totalRevenue,
      format: "currency",
      icon: Euro,
      description: "Ingresos generados"
    },
    {
      title: "Propuestas Enviadas",
      value: summary.totalProposalsSent,
      format: "number",
      icon: FileText,
      description: "Total enviadas"
    },
    {
      title: "Propuestas Ganadas",
      value: summary.totalProposalsWon,
      format: "number",
      icon: CheckCircle,
      description: "Propuestas aceptadas"
    },
    {
      title: "Propuestas Perdidas",
      value: summary.totalProposalsLost,
      format: "number",
      icon: XCircle,
      description: "Propuestas rechazadas"
    },
    {
      title: "Tasa de Conversión",
      value: summary.averageConversionRate,
      format: "percentage",
      icon: Target,
      description: "% de éxito promedio"
    },
    {
      title: "Valor Promedio",
      value: summary.averageDealSize,
      format: "currency",
      icon: TrendingUp,
      description: "Por propuesta ganada"
    }
  ]

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `€${value.toLocaleString()}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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
