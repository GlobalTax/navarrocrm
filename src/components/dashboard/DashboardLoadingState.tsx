
import { Skeleton } from '@/components/ui/skeleton'

export const DashboardLoadingState = () => (
  <div className="space-y-8">
    {/* Timer skeleton */}
    <Skeleton className="h-16 w-full" />
    
    {/* Métricas skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    
    {/* Layout principal skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <Skeleton className="xl:col-span-4 h-96" />
      <Skeleton className="xl:col-span-5 h-96" />
      <Skeleton className="xl:col-span-3 h-96" />
    </div>
  </div>
)
