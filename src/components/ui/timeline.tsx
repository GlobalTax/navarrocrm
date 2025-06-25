
import React from 'react'
import { cn } from '@/lib/utils'

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

export const Timeline: React.FC<TimelineProps> = ({ children, className }) => {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  )
}

interface TimelineItemProps {
  children: React.ReactNode
  className?: string
  isLast?: boolean
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ 
  children, 
  className,
  isLast = false 
}) => {
  return (
    <div className={cn("relative pb-4", className)}>
      {!isLast && (
        <div className="absolute left-4 top-6 w-0.5 h-full bg-border" />
      )}
      {children}
    </div>
  )
}

interface TimelineContentProps {
  children: React.ReactNode
  className?: string
}

export const TimelineContent: React.FC<TimelineContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("ml-8", className)}>
      {children}
    </div>
  )
}

interface TimelineMarkerProps {
  className?: string
  children?: React.ReactNode
}

export const TimelineMarker: React.FC<TimelineMarkerProps> = ({ 
  className,
  children 
}) => {
  return (
    <div className={cn(
      "absolute left-2 top-2 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center",
      className
    )}>
      {children}
    </div>
  )
}
