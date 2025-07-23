
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'
import { OptimizedDashboardData } from '@/hooks/useOptimizedDashboard'

const chartConfig = {
  horas: {
    label: 'Horas Registradas',
    color: '#0061FF'
  },
  facturado: {
    label: 'Horas Facturadas',
    color: '#2CBD6E'
  },
  objetivo: {
    label: 'Objetivo',
    color: '#FF9800'
  }
}

interface OptimizedPerformanceChartProps {
  data: OptimizedDashboardData
  isLoading?: boolean
}

export const OptimizedPerformanceChart = React.memo(({ 
  data, 
  isLoading 
}: OptimizedPerformanceChartProps) => {
  // Memoize trend calculations to prevent recalculation on every render
  const trendData = React.useMemo(() => {
    const performanceData = data.performanceData
    const currentMonth = performanceData[performanceData.length - 1]
    const previousMonth = performanceData[performanceData.length - 2]
    
    const trend = currentMonth && previousMonth ? 
      ((currentMonth.facturado - previousMonth.facturado) / previousMonth.facturado) * 100 : 0

    const goalAchievement = currentMonth ? 
      (currentMonth.facturado / (currentMonth.objetivo || 160)) * 100 : 0

    return { trend, goalAchievement, currentMonth, previousMonth }
  }, [data.performanceData])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px] bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const { trend, goalAchievement } = trendData

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Rendimiento Mensual</CardTitle>
            <p className="text-sm text-muted-foreground">
              Horas registradas vs facturadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {trend !== 0 && (
              <Badge variant={trend > 0 ? "default" : "destructive"} className="gap-1">
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend).toFixed(1)}%
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Target className="h-3 w-3" />
              {goalAchievement.toFixed(0)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={data.performanceData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine 
              y={160} 
              stroke="var(--color-objetivo)" 
              strokeDasharray="5 5"
              label={{ value: "Objetivo", position: "insideTopRight" }}
            />
            <Bar 
              dataKey="horas" 
              fill="var(--color-horas)" 
              radius={[2, 2, 0, 0]}
              className="opacity-80"
            />
            <Bar 
              dataKey="facturado" 
              fill="var(--color-facturado)" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0061FF] opacity-80"></div>
              <span className="text-muted-foreground">Registradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2CBD6E]"></div>
              <span className="text-muted-foreground">Facturadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-[#FF9800] border-dashed rounded-full"></div>
              <span className="text-muted-foreground">Objetivo</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

OptimizedPerformanceChart.displayName = 'OptimizedPerformanceChart'
