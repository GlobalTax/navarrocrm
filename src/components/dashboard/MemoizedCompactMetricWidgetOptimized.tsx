import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompactMetricWidgetProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  size?: 'sm' | 'md'
}

const CompactMetricWidget = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  size = 'md'
}: CompactMetricWidgetProps) => {
  const getChangeStyles = React.useMemo(() => {
    switch (changeType) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }, [changeType])

  const containerStyles = cn(
    'bg-white border border-black/10 rounded-[10px] shadow-sm p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
    size === 'sm' ? 'p-3' : 'p-4'
  )

  return (
    <div className={containerStyles}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-gray-600" />
        {change && (
          <span className={cn(
            'text-xs px-2 py-1 rounded-[6px] font-medium',
            getChangeStyles
          )}>
            {change}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <p className={cn(
          'font-semibold text-gray-900',
          size === 'sm' ? 'text-lg' : 'text-xl'
        )}>
          {value}
        </p>
        <p className={cn(
          'text-gray-600 font-medium',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {title}
        </p>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Comparación optimizada para evitar re-renders innecesarios
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.change === nextProps.change &&
    prevProps.changeType === nextProps.changeType &&
    prevProps.size === nextProps.size &&
    prevProps.icon === nextProps.icon
  )
})

CompactMetricWidget.displayName = 'CompactMetricWidget'

export { CompactMetricWidget as MemoizedCompactMetricWidgetOptimized }