
import * as React from "react"
import { cn } from "@/lib/utils"
import { EnhancedCard } from "./enhanced-card"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
  variant?: "default" | "gradient" | "glass"
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    title, 
    value, 
    subtitle, 
    trend = "neutral", 
    trendValue, 
    icon, 
    variant = "default",
    ...props 
  }, ref) => {
    const trendColors = {
      up: "text-green-600 bg-green-50",
      down: "text-red-600 bg-red-50",
      neutral: "text-gray-600 bg-gray-50"
    }

    const trendIcons = {
      up: "↗",
      down: "↘",
      neutral: "→"
    }

    return (
      <EnhancedCard
        ref={ref}
        variant={variant}
        className={cn("hover-lift p-6", className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon && <div className="text-gray-500">{icon}</div>}
              <h3 className="crm-metric-label">{title}</h3>
            </div>
            
            <div className="crm-metric-value mb-1">
              {value}
            </div>
            
            {subtitle && (
              <p className="text-caption text-gray-600 mb-2">
                {subtitle}
              </p>
            )}
            
            {trendValue && (
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-micro font-medium",
                trendColors[trend]
              )}>
                <span>{trendIcons[trend]}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
      </EnhancedCard>
    )
  }
)
MetricCard.displayName = "MetricCard"

export { MetricCard }
