
import * as React from "react"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { EnhancedCard, EnhancedCardContent } from "./enhanced-card"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  icon?: LucideIcon
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
  className
}) => {
  const variants = {
    default: "border-border",
    primary: "border-primary/20 bg-primary/5",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    danger: "border-red-200 bg-red-50"
  }

  const isPositiveChange = change && change.value > 0
  const isNegativeChange = change && change.value < 0

  return (
    <EnhancedCard 
      className={cn(variants[variant], "hover-glow", className)}
      hover
    >
      <EnhancedCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="crm-metric-primary text-3xl">
                {value}
              </span>
            </div>
            
            {change && (
              <div className="flex items-center gap-1 mt-2">
                {isPositiveChange && (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="crm-metric-change-positive text-sm">
                      +{change.value}% {change.period}
                    </span>
                  </>
                )}
                {isNegativeChange && (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="crm-metric-change-negative text-sm">
                      {change.value}% {change.period}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {Icon && (
            <div className="flex-shrink-0">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          )}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}

export { MetricCard }
