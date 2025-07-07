
import { Card, CardContent } from '@/components/ui/card'

interface UserStats {
  total: number
  active: number
  partners: number
  managers: number
  seniors: number
  juniors: number
}

interface UserMetricsProps {
  stats: UserStats
}

export const UserMetrics = ({ stats }: UserMetricsProps) => {
  const metrics = [
    { label: 'Total', value: stats.total, color: 'text-foreground' },
    { label: 'Activos', value: stats.active, color: 'text-green-600' },
    { label: 'Partners', value: stats.partners, color: 'text-purple-600' },
    { label: 'Managers', value: stats.managers, color: 'text-blue-600' },
    { label: 'Seniors', value: stats.seniors, color: 'text-emerald-600' },
    { label: 'Juniors', value: stats.juniors, color: 'text-yellow-600' }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-0.5 border-black rounded-[10px] hover-lift transition-all duration-200">
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-semibold ${metric.color} animate-fade-in`}>
              {metric.value}
            </div>
            <div className="text-sm text-muted-foreground">{metric.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
