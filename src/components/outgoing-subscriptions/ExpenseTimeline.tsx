import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useOutgoingSubscriptions } from '@/hooks/useOutgoingSubscriptions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export const ExpenseTimeline = () => {
  const { subscriptions, isLoading } = useOutgoingSubscriptions()
  const [timeRange, setTimeRange] = useState<'6months' | '12months' | '24months'>('12months')

  if (isLoading) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'ACTIVE') || []

  // Generar datos históricos basados en fechas de inicio
  const generateTimelineData = () => {
    const months = timeRange === '6months' ? 6 : timeRange === '12months' ? 12 : 24
    const data = []
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      // Calcular suscripciones activas en este mes
      const activeInMonth = activeSubscriptions.filter(sub => {
        const startDate = new Date(sub.start_date)
        return startDate <= monthEnd
      })
      
      const monthlySpend = activeInMonth.reduce((sum, sub) => {
        const startDate = new Date(sub.start_date)
        if (startDate <= monthEnd) {
          if (sub.billing_cycle === 'MONTHLY') {
            return sum + sub.amount
          } else if (sub.billing_cycle === 'YEARLY') {
            return sum + (sub.amount / 12)
          }
        }
        return sum
      }, 0)
      
      // Calcular acumulado
      const accumulated = data.length > 0 ? data[data.length - 1].accumulated + monthlySpend : monthlySpend
      
      data.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        monthlySpend: Math.round(monthlySpend * 100) / 100,
        accumulated: Math.round(accumulated * 100) / 100,
        subscriptionsCount: activeInMonth.length
      })
    }
    
    return data
  }

  const timelineData = generateTimelineData()
  
  // Calcular tendencia
  const calculateTrend = () => {
    if (timelineData.length < 2) return { trend: 'stable', percentage: 0 }
    
    const lastMonth = timelineData[timelineData.length - 1].monthlySpend
    const previousMonth = timelineData[timelineData.length - 2].monthlySpend
    
    if (previousMonth === 0) return { trend: 'stable', percentage: 0 }
    
    const percentage = ((lastMonth - previousMonth) / previousMonth) * 100
    
    if (percentage > 5) return { trend: 'up', percentage }
    if (percentage < -5) return { trend: 'down', percentage }
    return { trend: 'stable', percentage }
  }

  const { trend, percentage } = calculateTrend()

  const chartConfig = {
    monthlySpend: {
      label: "Gasto Mensual",
      color: "hsl(var(--primary))",
    },
    accumulated: {
      label: "Gasto Acumulado",
      color: "hsl(var(--secondary))",
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">Evolución Temporal del Gasto</CardTitle>
              <CardDescription>
                Análisis de tendencias mensuales y gasto acumulado
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-muted p-1 rounded-[8px]">
                <Button
                  variant={timeRange === '6months' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('6months')}
                  className="rounded-[6px] text-xs"
                >
                  6M
                </Button>
                <Button
                  variant={timeRange === '12months' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('12months')}
                  className="rounded-[6px] text-xs"
                >
                  12M
                </Button>
                <Button
                  variant={timeRange === '24months' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('24months')}
                  className="rounded-[6px] text-xs"
                >
                  24M
                </Button>
              </div>
              
              {/* Badge de tendencia */}
              <Badge className={`
                border-0.5 rounded-[10px] flex items-center gap-1
                ${trend === 'up' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                ${trend === 'down' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                ${trend === 'stable' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
              `}>
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {trend === 'stable' && <Minus className="h-3 w-3" />}
                {Math.abs(percentage).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tickFormatter={(value) => `€${typeof value === 'number' ? value.toFixed(0) : value}`}
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    labelFormatter={(label) => `Mes: ${label}`}
                    formatter={(value, name) => [
                      `€${typeof value === 'number' ? value.toFixed(2) : value}`,
                      name === 'monthlySpend' ? 'Gasto Mensual' : 'Gasto Acumulado'
                    ]}
                  />}
                />
                <Area
                  type="monotone"
                  dataKey="monthlySpend"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#monthlyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de línea para acumulado */}
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Gasto Acumulado</CardTitle>
          <CardDescription>
            Progresión del gasto total acumulado en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tickFormatter={(value) => `€${typeof value === 'number' ? value.toFixed(0) : value}`}
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    labelFormatter={(label) => `Mes: ${label}`}
                    formatter={(value, name, props) => [
                      `€${typeof value === 'number' ? value.toFixed(2) : value}`,
                      'Gasto Acumulado',
                      `${props.payload.subscriptionsCount} suscripciones activas`
                    ]}
                  />}
                />
                <Line
                  type="monotone"
                  dataKey="accumulated"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}