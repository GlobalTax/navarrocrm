import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

// Form Item compact wrapper
const CompactFormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-1', className)} {...props} />
))
CompactFormItem.displayName = 'CompactFormItem'

// Compact form label
const CompactFormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'crm-compact-label leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
))
CompactFormLabel.displayName = 'CompactFormLabel'

// Compact form control wrapper
const CompactFormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => (
  <Slot
    ref={ref}
    {...props}
  />
))
CompactFormControl.displayName = 'CompactFormControl'

// Compact form description
const CompactFormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('crm-list-item-secondary', className)}
    {...props}
  />
))
CompactFormDescription.displayName = 'CompactFormDescription'

// Compact form message (errors)
const CompactFormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs font-medium text-destructive', className)}
    {...props}
  >
    {children}
  </p>
))
CompactFormMessage.displayName = 'CompactFormMessage'

// Compact fieldset wrapper for grouped fields
const CompactFieldset = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn('space-y-2 border rounded-lg p-3', className)}
    {...props}
  />
))
CompactFieldset.displayName = 'CompactFieldset'

// Compact legend for fieldsets
const CompactLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement>
>(({ className, ...props }, ref) => (
  <legend
    ref={ref}
    className={cn('crm-compact-title px-1', className)}
    {...props}
  />
))
CompactLegend.displayName = 'CompactLegend'

export {
  CompactFormItem,
  CompactFormLabel,
  CompactFormControl,
  CompactFormDescription,
  CompactFormMessage,
  CompactFieldset,
  CompactLegend,
}