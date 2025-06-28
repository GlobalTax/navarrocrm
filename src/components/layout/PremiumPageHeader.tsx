
import { PremiumButton } from '@/components/ui/premium-button'

interface Badge {
  label: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
}

interface Action {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
}

interface PremiumPageHeaderProps {
  title: string
  description?: string
  badges?: Badge[]
  primaryAction?: Action
  secondaryAction?: Action
  children?: React.ReactNode
}

export const PremiumPageHeader = ({ 
  title, 
  description, 
  badges = [],
  primaryAction,
  secondaryAction,
  children
}: PremiumPageHeaderProps) => {
  const getBadgeStyles = (variant: string = 'primary') => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      case 'secondary':
        return 'bg-premium-gray-5 text-premium-secondary border border-premium-gray-light'
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200'
    }
  }

  return (
    <div className="premium-spacing-md mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="flex-1 premium-spacing-sm">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="premium-text-title">{title}</h1>
            {badges.map((badge, index) => (
              <span 
                key={index}
                className={`premium-badge ${getBadgeStyles(badge.variant)}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          {description && (
            <p className="premium-text-caption max-w-2xl">{description}</p>
          )}
        </div>
        
        {(primaryAction || secondaryAction || children) && (
          <div className="flex items-center gap-3">
            {children}
            {secondaryAction && (
              <PremiumButton
                variant="secondary"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </PremiumButton>
            )}
            {primaryAction && (
              <PremiumButton
                variant="primary"
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </PremiumButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
