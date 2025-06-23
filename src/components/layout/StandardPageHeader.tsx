
import { Badge } from '@/components/ui/badge'

interface BadgeInfo {
  label: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  color?: string
}

interface StandardPageHeaderProps {
  title: string
  description?: string
  badges?: BadgeInfo[]
  actions?: React.ReactNode
  className?: string
}

export const StandardPageHeader = ({ 
  title, 
  description, 
  badges = [],
  actions,
  className = ""
}: StandardPageHeaderProps) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {badges.map((badge, index) => (
            <Badge 
              key={index} 
              variant={badge.variant || 'default'}
              className={badge.color}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
        {description && (
          <p className="text-gray-600 text-lg">{description}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
