
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

interface StandardPageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  primaryAction?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
  badges?: Array<{
    label: string
    variant?: 'default' | 'secondary' | 'outline'
    color?: string
  }>
  children?: React.ReactNode
}

export const StandardPageHeader = ({
  title,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
  badges,
  children
}: StandardPageHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
        {badges && badges.length > 0 && (
          <div className="flex items-center gap-3 mt-3">
            {badges.map((badge, index) => (
              <Badge 
                key={index} 
                variant={badge.variant || 'outline'} 
                className={badge.color}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {secondaryAction && (
          <Button 
            onClick={secondaryAction.onClick} 
            variant={secondaryAction.variant || 'outline'} 
            size="lg"
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button 
            onClick={primaryAction.onClick} 
            variant={primaryAction.variant || 'default'} 
            size="lg"
          >
            {primaryAction.label}
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}
