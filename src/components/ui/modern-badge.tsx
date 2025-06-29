
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modernBadgeVariants = cva(
  "crm-status-badge inline-flex items-center gap-1.5 transition-all duration-200 hover:scale-105",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 border-gray-200",
        primary: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border-border",
        success: "crm-status-active",
        warning: "crm-status-pending",
        destructive: "bg-red-100 text-red-800 border-red-200",
        outline: "text-foreground border-border bg-transparent",
        gradient: "gradient-primary text-white border-transparent shadow-sm"
      },
      size: {
        default: "px-3 py-1 text-sm",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-2 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ModernBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernBadgeVariants> {
  dot?: boolean
}

function ModernBadge({ className, variant, size, dot, children, ...props }: ModernBadgeProps) {
  return (
    <div className={cn(modernBadgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <div className={cn(
          "w-2 h-2 rounded-full",
          variant === "success" && "bg-green-600",
          variant === "warning" && "bg-yellow-600",
          variant === "destructive" && "bg-red-600",
          variant === "primary" && "bg-primary",
          (!variant || variant === "default") && "bg-gray-600"
        )} />
      )}
      {children}
    </div>
  )
}

export { ModernBadge, modernBadgeVariants }
