import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useLazyComponent } from '@/hooks/useLazyComponent'
import { cn } from '@/lib/utils'

interface LazyWidgetProps {
  children: ReactNode
  delay?: number
  fallback?: ReactNode
  className?: string
  priority?: 'immediate' | 'delayed' | 'intersection'
}

const SkeletonFallback = ({ className }: { className?: string }) => (
  <Card className={cn("animate-pulse", className)}>
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-8 bg-muted rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    </CardContent>
  </Card>
)

export const LazyWidget = ({ 
  children, 
  delay = 0, 
  fallback, 
  className,
  priority = 'intersection'
}: LazyWidgetProps) => {
  const lazyConfig = {
    immediate: { delay: 0 },
    delayed: { delay: 1000 },
    intersection: { delay: 0 }
  }

  const { elementRef, shouldLoad } = useLazyComponent(lazyConfig[priority])

  if (priority === 'immediate') {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={elementRef} className={cn("min-h-[200px]", className)}>
      {shouldLoad ? (
        <div className="animate-fade-in">
          {children}
        </div>
      ) : (
        fallback || <SkeletonFallback className={className} />
      )}
    </div>
  )
}