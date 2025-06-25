
import { Card, CardContent } from '@/components/ui/card'
import { MetricCardProps } from '../types/MetricCardTypes'

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, className }: MetricCardProps) => {
  const getTrendColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          {trend && (
            <span className={`text-sm font-medium ${getTrendColor(trend.type)}`}>
              {trend.value}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
