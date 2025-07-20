import React from 'react'
import { useLazyRender } from '@/hooks/performance/useLazyRender'

interface LazyRenderComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  delay?: number
  className?: string
  style?: React.CSSProperties
  minHeight?: number
}

const DefaultFallback = ({ minHeight = 100 }: { minHeight?: number }) => (
  <div 
    className="flex items-center justify-center border-0.5 border-black rounded-[10px] bg-muted/20"
    style={{ minHeight }}
  >
    <div className="animate-pulse flex space-x-2">
      <div className="rounded-full bg-muted h-3 w-3" />
      <div className="rounded-full bg-muted h-3 w-3" />
      <div className="rounded-full bg-muted h-3 w-3" />
    </div>
  </div>
)

export function LazyRenderComponent({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  delay = 0,
  className = '',
  style,
  minHeight = 100
}: LazyRenderComponentProps) {
  const { shouldRender, containerRef } = useLazyRender({
    threshold,
    rootMargin,
    delay
  })

  const FallbackComponent = fallback || <DefaultFallback minHeight={minHeight} />

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={style}
    >
      {shouldRender ? children : FallbackComponent}
    </div>
  )
}