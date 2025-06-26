
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Database } from 'lucide-react'

interface PWACacheStatsIndicatorProps {
  cacheStats: any
  isOnline: boolean
}

export const PWACacheStatsIndicator: React.FC<PWACacheStatsIndicatorProps> = ({
  cacheStats,
  isOnline
}) => {
  if (!cacheStats) return null

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isOnline ? "default" : "secondary"}
            className="flex items-center space-x-1 cursor-help"
          >
            <Database className="h-3 w-3" />
            <span>{formatBytes(cacheStats.totalSize || 0)}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium mb-1">Cache Local</div>
            <div>Tamaño: {formatBytes(cacheStats.totalSize || 0)}</div>
            <div>Entradas: {cacheStats.totalEntries || 0}</div>
            <div>Estado: {isOnline ? 'Sincronizado' : 'Offline'}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
