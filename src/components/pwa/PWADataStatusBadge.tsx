
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Database, Wifi, Clock, AlertTriangle } from 'lucide-react'

interface PWADataStatusBadgeProps {
  isFromCache?: boolean
  lastUpdated?: Date
  isStale?: boolean
  size?: 'sm' | 'default'
}

export const PWADataStatusBadge: React.FC<PWADataStatusBadgeProps> = ({
  isFromCache = false,
  lastUpdated,
  isStale = false,
  size = 'sm'
}) => {
  const getBadgeVariant = () => {
    if (isStale) return 'destructive'
    if (isFromCache) return 'secondary'
    return 'default'
  }

  const getBadgeIcon = () => {
    if (isStale) return <AlertTriangle className="h-3 w-3" />
    if (isFromCache) return <Database className="h-3 w-3" />
    return <Wifi className="h-3 w-3" />
  }

  const getBadgeText = () => {
    if (isStale) return 'Datos antiguos'
    if (isFromCache) return 'Cache'
    return 'Actualizado'
  }

  const getTooltipContent = () => {
    if (isStale) {
      return 'Los datos pueden estar desactualizados. Verifique su conexión.'
    }
    if (isFromCache) {
      return `Datos desde cache local${lastUpdated ? ` (${lastUpdated.toLocaleString()})` : ''}`
    }
    return `Datos actualizados desde el servidor${lastUpdated ? ` (${lastUpdated.toLocaleString()})` : ''}`
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getBadgeVariant()}
            className={`flex items-center space-x-1 ${
              size === 'sm' ? 'text-xs px-1.5 py-0.5' : ''
            }`}
          >
            {getBadgeIcon()}
            <span>{getBadgeText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="text-sm">{getTooltipContent()}</p>
            {lastUpdated && (
              <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{lastUpdated.toLocaleString()}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
