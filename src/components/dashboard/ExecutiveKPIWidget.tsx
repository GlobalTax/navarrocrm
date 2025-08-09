import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Euro, Target, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPIMetric {
  title: string
  value: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
  }
  target?: {
    value: string
    percentage: number
  }
  type: 'revenue' | 'efficiency' | 'time'
}

interface ExecutiveKPIWidgetProps {
  kpis: KPIMetric[]
  isLoading?: boolean
}

export const ExecutiveKPIWidget = ({ kpis, isLoading }: ExecutiveKPIWidgetProps) => {
  if (isLoading) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900">KPIs Ejecutivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getKPIIcon = (type: KPIMetric['type']) => {
    switch (type) {
      case 'revenue':
        return Euro
      case 'efficiency':
        return Target
      case 'time':
        return Clock
      default:
        return TrendingUp
    }
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return TrendingUp
      case 'down':
        return TrendingDown
      case 'stable':
        return Minus
      default:
        return Minus
    }
  }

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'stable':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className="border-0.5 border-black rounded-[10px] hover-lift">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">KPIs Ejecutivos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {kpis.map((kpi, index) => {
            const IconComponent = getKPIIcon(kpi.type)
            const TrendIcon = kpi.trend ? getTrendIcon(kpi.trend.direction) : null
            
            return (
              <div key={index} className="p-4 bg-gray-50 rounded-[10px] border-0.5 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border-0.5 border-gray-200">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                        {kpi.title}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {kpi.value}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {kpi.trend && TrendIcon && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        getTrendColor(kpi.trend.direction)
                      )}>
                        <TrendIcon className="h-3 w-3" />
                        {Math.abs(kpi.trend.value)}%
                      </div>
                    )}
                    
                    {kpi.target && (
                      <div className="mt-1">
                        <Badge 
                          variant={kpi.target.percentage >= 100 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {kpi.target.percentage}% del objetivo
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Meta: {kpi.target.value}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}