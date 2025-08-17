import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Receipt } from 'lucide-react'

interface BillingStatusBadgeProps {
  status: 'unbilled' | 'billed' | 'invoiced'
  className?: string
}

export const BillingStatusBadge = ({ status, className }: BillingStatusBadgeProps) => {
  const getStatusConfig = (status: 'unbilled' | 'billed' | 'invoiced') => {
    switch (status) {
      case 'unbilled':
        return {
          label: 'Sin facturar',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }
      case 'billed':
        return {
          label: 'Facturado',
          variant: 'default' as const,
          icon: Receipt,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        }
      case 'invoiced':
        return {
          label: 'Cobrado',
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-50 text-green-700 border-green-200'
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className} flex items-center gap-1`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}