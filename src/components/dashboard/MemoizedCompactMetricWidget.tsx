import React from 'react'
import { CompactMetricWidget } from './CompactMetricWidget'
import { LucideIcon } from 'lucide-react'

interface MemoizedCompactMetricWidgetProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  size?: 'sm' | 'md'
}

export const MemoizedCompactMetricWidget = React.memo<MemoizedCompactMetricWidgetProps>(
  ({ title, value, change, changeType, icon, size }) => {
    return (
      <CompactMetricWidget
        title={title}
        value={value}
        change={change}
        changeType={changeType}
        icon={icon}
        size={size}
      />
    )
  },
  // Custom comparison function for performance
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.value === nextProps.value &&
      prevProps.change === nextProps.change &&
      prevProps.changeType === nextProps.changeType &&
      prevProps.icon === nextProps.icon &&
      prevProps.size === nextProps.size
    )
  }
)

MemoizedCompactMetricWidget.displayName = 'MemoizedCompactMetricWidget'