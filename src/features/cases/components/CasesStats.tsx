import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, Clock, Pause } from 'lucide-react'
import { Case } from '@/features/cases'

interface CasesStatsProps {
  cases: Case[]
}

export function CasesStats({ cases }: CasesStatsProps) {
  const total = cases.length
  const open = cases.filter(c => c.status === 'open').length
  const closed = cases.filter(c => c.status === 'closed').length
  const on_hold = cases.filter(c => c.status === 'on_hold').length

  const stats = [
    {
      title: 'Total Expedientes',
      value: total,
      icon: FileText,
      description: 'Expedientes en el sistema'
    },
    {
      title: 'Abiertos',
      value: open,
      icon: CheckCircle,
      description: 'Expedientes activos'
    },
    {
      title: 'Cerrados',
      value: closed,
      icon: Clock,
      description: 'Expedientes finalizados'
    },
    {
      title: 'En Espera',
      value: on_hold,
      icon: Pause,
      description: 'Expedientes pausados'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}