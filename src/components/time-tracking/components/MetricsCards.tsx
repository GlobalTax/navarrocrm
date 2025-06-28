
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, Target, Users } from 'lucide-react'
import type { TimeMetrics } from '@/hooks/useTimeTrackingMetrics'

interface MetricsCardsProps {
  overallMetrics: TimeMetrics
  teamMetrics: any[]
  canViewTeams: boolean
}

export const MetricsCards = ({ overallMetrics, teamMetrics, canViewTeams }: MetricsCardsProps) => {
  const getMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode, trend?: string) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <Badge variant="secondary" className="text-xs">
                  {trend}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {getMetricCard(
        "Horas Totales",
        overallMetrics.totalHours,
        `${overallMetrics.totalEntries} registros`,
        <Clock className="h-4 w-4 text-blue-600" />,
        "+12%"
      )}
      
      {getMetricCard(
        "Horas Facturables",
        overallMetrics.billableHours,
        `${overallMetrics.utilizationRate}% utilización`,
        <DollarSign className="h-4 w-4 text-green-600" />,
        "+8%"
      )}
      
      {getMetricCard(
        "Promedio por Registro",
        `${overallMetrics.avgEntryDuration}min`,
        "Duración media",
        <Target className="h-4 w-4 text-purple-600" />
      )}
      
      {getMetricCard(
        canViewTeams ? "Equipos Activos" : "Mi Productividad",
        canViewTeams ? teamMetrics.length : "⭐⭐⭐⭐",
        canViewTeams ? "equipos supervisados" : `${overallMetrics.totalEntries} entradas`,
        <Users className="h-4 w-4 text-orange-600" />
      )}
    </div>
  )
}
