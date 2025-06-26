
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardCleanProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  className?: string
}

export const MetricCardClean = ({ 
  title, 
  value, 
  subtitle, 
  trend,
  className 
}: MetricCardCleanProps) => {
  const getTrendColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200 border-0.5 border-black rounded-[10px]", 
      className
    )}>
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Valor principal */}
          <div className="text-3xl font-bold text-gray-900 font-manrope">
            {value}
          </div>
          
          {/* Título */}
          <div className="text-sm font-medium text-gray-700">
            {title}
          </div>
          
          {/* Subtítulo */}
          {subtitle && (
            <div className="text-xs text-gray-500">
              {subtitle}
            </div>
          )}
          
          {/* Tendencia */}
          {trend && (
            <div className={cn(
              "text-xs font-medium",
              getTrendColor(trend.type)
            )}>
              {trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
