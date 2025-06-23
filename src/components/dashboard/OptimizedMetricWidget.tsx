
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricWidgetProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const OptimizedMetricWidget = React.memo<MetricWidgetProps>(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className 
}) => {
  const trendColor = trend?.isPositive ? 'text-green-600' : 'text-red-600'
  const trendSymbol = trend?.isPositive ? '+' : ''

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs ${trendColor} mt-1`}>
            {trendSymbol}{trend.value}% vs mes anterior
          </p>
        )}
      </CardContent>
    </Card>
  )
})

OptimizedMetricWidget.displayName = 'OptimizedMetricWidget'

export { OptimizedMetricWidget }
