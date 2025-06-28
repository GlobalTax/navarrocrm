
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const premiumButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 premium-focus",
  {
    variants: {
      variant: {
        primary: "premium-button-primary",
        secondary: "premium-button-secondary",
        ghost: "premium-button-hover text-premium-primary hover:bg-premium-gray-5 rounded-lg px-3 py-2",
        minimal: "premium-button-hover text-premium-secondary hover:text-premium-primary rounded-md px-2 py-1.5"
      },
      size: {
        default: "px-4 py-2.5 rounded-lg",
        sm: "px-3 py-2 rounded-md text-xs",
        lg: "px-6 py-3 rounded-lg text-base",
        icon: "h-9 w-9 rounded-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
)

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  asChild?: boolean
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(premiumButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton, premiumButtonVariants }
