import * as React from 'react'
import { cn } from '@/lib/utils'

const CompactCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "crm-card p-3 space-y-2",
      className
    )}
    {...props}
  />
))
CompactCard.displayName = 'CompactCard'

const CompactCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1', className)} {...props} />
))
CompactCardHeader.displayName = 'CompactCardHeader'

const CompactCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('crm-compact-title leading-none tracking-tight', className)}
    {...props}
  />
))
CompactCardTitle.displayName = 'CompactCardTitle'

const CompactCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('crm-compact-text', className)}
    {...props}
  />
))
CompactCardDescription.displayName = 'CompactCardDescription'

const CompactCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))
CompactCardContent.displayName = 'CompactCardContent'

const CompactCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center pt-2', className)} {...props} />
))
CompactCardFooter.displayName = 'CompactCardFooter'

export {
  CompactCard,
  CompactCardHeader,
  CompactCardTitle,
  CompactCardDescription,
  CompactCardContent,
  CompactCardFooter,
}