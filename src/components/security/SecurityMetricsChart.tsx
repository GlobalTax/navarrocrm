import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface SecurityMetricData {
  date: string
  failed_logins: number
  data_access: number
  total_events: number
}

export const SecurityMetricsChart = () => {
  const { user } = useApp()
  const [chartData, setChartData] = useState<SecurityMetricData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMetricsData()
  }, [user?.org_id])

  const fetchMetricsData = async () => {
    if (!user?.org_id) return

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 7) // Last 7 days

      // Get daily security metrics
      const { data: errorData } = await supabase
        .from('analytics_errors')
        .select('created_at, error_type')
        .eq('org_id', user.org_id)
        .eq('error_type', 'auth_error')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('created_at, event_type')
        .eq('org_id', user.org_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Process data by day
      const dailyData: Record<string, SecurityMetricData> = {}
      
      // Initialize all days with zero values
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        dailyData[dateStr] = {
          date: dateStr,
          failed_logins: 0,
          data_access: 0,
          total_events: 0
        }
      }

      // Count auth errors by day
      errorData?.forEach(error => {
        const dateStr = error.created_at.split('T')[0]
        if (dailyData[dateStr]) {
          dailyData[dateStr].failed_logins++
        }
      })

      // Count events by day
      eventsData?.forEach(event => {
        const dateStr = event.created_at.split('T')[0]
        if (dailyData[dateStr]) {
          dailyData[dateStr].total_events++
          if (event.event_type === 'data_access') {
            dailyData[dateStr].data_access++
          }
        }
      })

      // Convert to array and sort by date
      const chartArray = Object.values(dailyData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ).map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))

      setChartData(chartArray)
    } catch (error) {
      console.error('Error fetching metrics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Seguridad (7 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Seguridad (7 días)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              labelFormatter={(label) => `Fecha: ${label}`}
              formatter={(value, name) => [
                value,
                name === 'failed_logins' ? 'Intentos Fallidos' :
                name === 'data_access' ? 'Accesos a Datos' : 'Total Eventos'
              ]}
            />
            <Area
              type="monotone"
              dataKey="failed_logins"
              stackId="1"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive) / 0.2)"
            />
            <Area
              type="monotone"
              dataKey="data_access"
              stackId="1"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary) / 0.2)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}