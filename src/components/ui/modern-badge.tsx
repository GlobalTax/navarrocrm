
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modernBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover-scale",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover-scale",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover-scale",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground hover-scale",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200 hover-scale",
        warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover-scale",
        glass: "glass-card text-gray-900 hover:bg-white/20 hover-scale",
        gradient: "gradient-primary text-white border-transparent hover-scale hover-glow"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ModernBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernBadgeVariants> {}

function ModernBadge({ className, variant, ...props }: ModernBadgeProps) {
  return (
    <div className={cn(modernBadgeVariants({ variant }), className)} {...props} />
  )
}

export { ModernBadge, modernBadgeVariants }
