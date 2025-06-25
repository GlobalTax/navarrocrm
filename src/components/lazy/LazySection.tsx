
import React from 'react'
import { LazyWrapper } from './LazyWrapper'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface LazySectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
}

export const LazySection = ({ 
  title, 
  children, 
  className = '', 
  threshold, 
  rootMargin 
}: LazySectionProps) => {
  const fallback = (
    <Card className={`p-6 ${className}`}>
      {title && <Skeleton className="h-6 w-48 mb-4" />}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Card>
  )

  return (
    <LazyWrapper
      fallback={fallback}
      threshold={threshold}
      rootMargin={rootMargin}
      className={className}
    >
      {children}
    </LazyWrapper>
  )
}
