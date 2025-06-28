
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import type { TimeMetrics } from '@/hooks/useTimeTrackingMetrics'

interface InsightsSectionProps {
  overallMetrics: TimeMetrics
  teamMetrics: any[]
  canViewTeams: boolean
}

export const InsightsSection = ({ overallMetrics, teamMetrics, canViewTeams }: InsightsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Insights y Recomendaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {overallMetrics.utilizationRate > 80 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-green-900">Excelente productividad</p>
                <p className="text-sm text-green-700">
                  La utilización de {overallMetrics.utilizationRate}% está por encima del objetivo
                </p>
              </div>
            </div>
          )}
          
          {teamMetrics.filter(t => t.utilization < 60).length > 0 && canViewTeams && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-orange-900">Atención requerida</p>
                <p className="text-sm text-orange-700">
                  {teamMetrics.filter(t => t.utilization < 60).length} equipo(s) con utilización por debajo del 60%
                </p>
              </div>
            </div>
          )}
          
          {overallMetrics.totalHours > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-blue-900">Progreso registrado</p>
                <p className="text-sm text-blue-700">
                  {overallMetrics.totalHours} horas registradas con {overallMetrics.totalEntries} entradas
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
