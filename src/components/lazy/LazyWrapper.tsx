
import React from 'react'
import { useLazyLoading } from '@/hooks/lazy'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

export const LazyWrapper = ({ 
  children, 
  fallback, 
  threshold, 
  rootMargin, 
  className = '' 
}: LazyWrapperProps) => {
  const { elementRef, isVisible, isLoaded, isLoading, isError, retry } = useLazyLoading({
    threshold,
    rootMargin
  })

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isError ? (
        <div className="text-center py-4">
          <p className="text-red-500 mb-2">Error al cargar contenido</p>
          <button 
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      ) : isLoaded ? (
        children
      ) : isVisible || isLoading ? (
        fallback || <Skeleton className="h-32 w-full" />
      ) : (
        <div className="h-32" /> // Placeholder para mantener el layout
      )}
    </div>
  )
}
