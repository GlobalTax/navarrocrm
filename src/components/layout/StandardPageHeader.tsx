
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StandardPageHeaderProps {
  title: string
  description?: string
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
  primaryAction,
  secondaryAction,
  badges,
  children
}: StandardPageHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
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
            size="default"
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button 
            onClick={primaryAction.onClick} 
            variant={primaryAction.variant || 'default'} 
            size="default"
          >
            {primaryAction.label}
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}
