import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
interface BadgeInfo {
  label: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  color?: string;
}
interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
interface StandardPageHeaderProps {
  title: string;
  description?: string;
  badges?: BadgeInfo[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  className?: string;
  customContent?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'stats';
  statsContent?: React.ReactNode;
}
export const StandardPageHeader = ({
  title,
  description,
  badges = [],
  actions,
  children,
  primaryAction,
  secondaryAction,
  className = "",
  customContent,
  variant = 'default',
  statsContent
}: StandardPageHeaderProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'border-0.5 border-black rounded-[10px] bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm p-6';
      case 'stats':
        return 'border-0.5 border-black rounded-[10px] bg-white shadow-sm p-6';
      default:
        return 'border-0.5 border-black rounded-[10px] bg-white shadow-sm p-4';
    }
  };

  if (variant === 'gradient' && customContent) {
    return (
      <div className={`${getVariantClasses()} mb-6 ${className}`}>
        <div className="text-center">
          <h1 className="crm-responsive-title font-bold mb-4">{title}</h1>
          {description && <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">{description}</p>}
          {customContent}
        </div>
      </div>
    );
  }

  if (variant === 'stats' && statsContent) {
    return (
      <div className={`${getVariantClasses()} mb-6 ${className}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="text-center lg:text-left">
            <h1 className="crm-responsive-title font-bold mb-4">{title}</h1>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
          {statsContent}
        </div>
      </div>
    );
  }

  return (
    <div className={`${getVariantClasses()} mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="crm-responsive-title font-normal">{title}</h1>
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant || 'default'} className={`crm-badge-text ${badge.color}`}>
                {badge.label}
              </Badge>
            ))}
          </div>
          {description && <p className="text-gray-600">{description}</p>}
          {customContent}
        </div>
        
        {(actions || primaryAction || secondaryAction || children) && (
          <div className="flex items-center gap-2">
            {children}
            {secondaryAction && (
              <Button variant={secondaryAction.variant || 'outline'} onClick={secondaryAction.onClick} className="crm-button-text">
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button variant={primaryAction.variant || 'default'} onClick={primaryAction.onClick} className="crm-button-text">
                {primaryAction.label}
              </Button>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};