
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Users, Target } from 'lucide-react'
import { useTimeTrackingMetrics } from '@/hooks/useTimeTrackingMetrics'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export const ProductivityTab = () => {
  const { overallMetrics, teamMetrics, canViewTeams } = useTimeTrackingMetrics('month')

  // Datos de ejemplo para el gráfico de productividad
  const productivityData = [
    { day: 'Lun', hours: 8.2, billable: 6.5 },
    { day: 'Mar', hours: 7.8, billable: 6.2 },
    { day: 'Mié', hours: 8.5, billable: 7.1 },
    { day: 'Jue', hours: 8.0, billable: 6.8 },
    { day: 'Vie', hours: 7.5, billable: 6.0 }
  ]

  const chartConfig = {
    hours: {
      label: 'Horas Totales',
      color: '#8b5cf6'
    },
    billable: {
      label: 'Horas Facturables',
      color: '#10b981'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{overallMetrics.totalHours}h</div>
            <div className="text-sm text-slate-600">Horas Registradas</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{overallMetrics.utilizationRate}%</div>
            <div className="text-sm text-slate-600">Utilización</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{overallMetrics.avgEntryDuration}min</div>
            <div className="text-sm text-slate-600">Promedio por Registro</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Productividad Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="var(--color-hours)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="billable" 
                  stroke="var(--color-billable)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {canViewTeams && teamMetrics.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-slate-900">
              Productividad por Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMetrics.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-medium text-slate-900">{team.name}</span>
                    <span className="text-sm text-slate-600">({team.members} miembros)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{team.hours}h</div>
                    <div className="text-sm text-slate-600">{team.utilization}% utilización</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
