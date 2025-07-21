
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { memo } from 'react'

interface MetricWidgetProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  progress?: number
  description?: string
  className?: string
}

const MetricWidgetComponent = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon, 
  progress,
  description,
  className 
}: MetricWidgetProps) => {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {change && (
          <p className={cn(
            "text-xs flex items-center gap-1",
            changeType === 'positive' && "text-green-600",
            changeType === 'negative' && "text-red-600",
            changeType === 'neutral' && "text-muted-foreground"
          )}>
            {change}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% completado</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Memoización con comparador específico para props de métricas
export const MetricWidget = memo(MetricWidgetComponent, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.change === nextProps.change &&
    prevProps.changeType === nextProps.changeType &&
    prevProps.icon === nextProps.icon &&
    prevProps.progress === nextProps.progress &&
    prevProps.description === nextProps.description &&
    prevProps.className === nextProps.className
  )
})

MetricWidget.displayName = 'MetricWidget'
