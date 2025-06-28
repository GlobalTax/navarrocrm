
import * as React from "react"
import { cn } from "@/lib/utils"

const PremiumCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "premium-card premium-animate-in",
      className
    )}
    {...props}
  />
))
PremiumCard.displayName = "PremiumCard"

const PremiumCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pb-4 premium-spacing-sm", className)}
    {...props}
  />
))
PremiumCardHeader.displayName = "PremiumCardHeader"

const PremiumCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("premium-text-title", className)}
    {...props}
  />
))
PremiumCardTitle.displayName = "PremiumCardTitle"

const PremiumCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("premium-text-caption", className)}
    {...props}
  />
))
PremiumCardDescription.displayName = "PremiumCardDescription"

const PremiumCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />
))
PremiumCardContent.displayName = "PremiumCardContent"

export { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription, PremiumCardContent }
