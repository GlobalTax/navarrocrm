
export interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  className?: string
}
