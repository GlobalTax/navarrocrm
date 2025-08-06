import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const standardBadgeVariants = cva(
  'crm-badge crm-badge-text inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-primary hover:bg-primary/80 text-primary-foreground',
        secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
        destructive: 'bg-destructive hover:bg-destructive/80 text-destructive-foreground',
        outline: 'text-foreground bg-background hover:bg-accent hover:text-accent-foreground',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        warning: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
        info: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface StandardBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof standardBadgeVariants> {}

function StandardBadge({ className, variant, ...props }: StandardBadgeProps) {
  return (
    <div className={cn(standardBadgeVariants({ variant }), className)} {...props} />
  )
}

export { StandardBadge, standardBadgeVariants }