import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface StatusBadgeProps {
  status: 'published' | 'draft' | 'new' | 'updated' | 'popular' | 'complete' | 'incomplete'
  className?: string
  tooltip?: string
  size?: 'sm' | 'default'
}

const statusConfig = {
  published: {
    label: 'Publicado',
    className: 'bg-academia-success/10 text-academia-success border-academia-success/20',
    tooltip: 'Curso visible para todos los usuarios'
  },
  draft: {
    label: 'Borrador',
    className: 'bg-academia-warning/10 text-academia-warning border-academia-warning/20',
    tooltip: 'Curso en desarrollo, no visible para usuarios'
  },
  new: {
    label: 'NUEVO',
    className: 'bg-academia/10 text-academia border-academia/20 animate-pulse',
    tooltip: 'Creado en los últimos 7 días'
  },
  updated: {
    label: 'ACTUALIZADO',
    className: 'bg-academia-intermediate/10 text-academia-intermediate border-academia-intermediate/20',
    tooltip: 'Modificado recientemente'
  },
  popular: {
    label: 'POPULAR',
    className: 'bg-purple-50 text-purple-600 border-purple-200',
    tooltip: 'Curso con muchas lecciones'
  },
  complete: {
    label: 'COMPLETO',
    className: 'bg-academia-success/10 text-academia-success border-academia-success/20',
    tooltip: 'Tiene todas las lecciones necesarias'
  },
  incomplete: {
    label: 'INCOMPLETO',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
    tooltip: 'Le faltan lecciones'
  }
}

export function StatusBadge({ status, className, tooltip, size = 'default' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const finalTooltip = tooltip || config.tooltip

  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        config.className,
        size === 'sm' && 'text-xs px-1.5 py-0.5',
        'transition-all duration-200 hover:scale-105',
        className
      )}
    >
      {config.label}
    </Badge>
  )

  if (finalTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>{finalTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badge
}