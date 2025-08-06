import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface StandardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'metric'
}

const StandardCard = forwardRef<HTMLDivElement, StandardCardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'crm-card',
          {
            'hover:cursor-pointer': variant === 'interactive',
            'p-6': variant === 'metric',
            'p-4': variant !== 'metric'
          },
          className
        )}
        {...props}
      />
    )
  }
)
StandardCard.displayName = 'StandardCard'

const StandardCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
StandardCardHeader.displayName = 'StandardCardHeader'

const StandardCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('crm-card-title', className)}
    {...props}
  />
))
StandardCardTitle.displayName = 'StandardCardTitle'

const StandardCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('crm-body-text', className)}
    {...props}
  />
))
StandardCardDescription.displayName = 'StandardCardDescription'

const StandardCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
StandardCardContent.displayName = 'StandardCardContent'

const StandardCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
StandardCardFooter.displayName = 'StandardCardFooter'

export {
  StandardCard,
  StandardCardHeader,
  StandardCardTitle,
  StandardCardDescription,
  StandardCardContent,
  StandardCardFooter,
}