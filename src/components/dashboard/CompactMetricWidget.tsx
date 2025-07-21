
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { memo } from 'react'

interface CompactMetricWidgetProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  className?: string
  size?: 'sm' | 'md'
}

const CompactMetricWidgetComponent = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon, 
  className,
  size = 'sm'
}: CompactMetricWidgetProps) => {
  return (
    <Card className={cn(
      "hover-glow transition-all duration-200 border-gray-150",
      size === 'sm' ? "min-h-[80px]" : "min-h-[100px]",
      className
    )}>
      <CardContent className={cn(
        "flex items-center justify-between p-4",
        size === 'sm' ? "gap-3" : "gap-4"
      )}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={cn(
              "font-bold text-gray-900 leading-none",
              size === 'sm' ? "text-xl" : "text-2xl"
            )}>
              {value}
            </p>
            {change && (
              <span className={cn(
                "text-xs font-medium",
                changeType === 'positive' && "text-green-600",
                changeType === 'negative' && "text-red-600",
                changeType === 'neutral' && "text-gray-500"
              )}>
                {change}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Icon className={cn(
              "text-gray-600",
              size === 'sm' ? "h-4 w-4" : "h-5 w-5"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Memoización con comparador optimizado para props estables
export const CompactMetricWidget = memo(CompactMetricWidgetComponent, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.change === nextProps.change &&
    prevProps.changeType === nextProps.changeType &&
    prevProps.icon === nextProps.icon &&
    prevProps.className === nextProps.className &&
    prevProps.size === nextProps.size
  )
})

CompactMetricWidget.displayName = 'CompactMetricWidget'
