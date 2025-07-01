
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { EnhancedAIUsageStats } from '@/hooks/useEnhancedAIUsage'

interface AIUsageTrendsChartProps {
  stats: EnhancedAIUsageStats
  isLoading: boolean
}

export function AIUsageTrendsChart({ stats, isLoading }: AIUsageTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencias de Uso (Últimos 6 Meses)</CardTitle>
        <CardDescription>
          Evolución de llamadas, tokens y costos a lo largo del tiempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name
              ]}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="calls" 
              stroke="#8884d8" 
              name="Llamadas"
              strokeWidth={2}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="tokens" 
              stroke="#82ca9d" 
              name="Tokens (k)"
              strokeWidth={2}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="cost" 
              stroke="#ff7300" 
              name="Costo (€)"
              strokeWidth={2}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="successRate" 
              stroke="#387908" 
              name="Éxito (%)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
