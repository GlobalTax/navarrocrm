
import React, { Suspense, memo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle } from 'lucide-react'

interface LazyChartProps {
  children: React.ReactNode
  title?: string
  description?: string
  height?: number
  fallbackHeight?: number
}

const ChartSkeleton = ({ height = 200, title }: { height?: number; title?: string }) => (
  <Card className="border-0.5 border-gray-200">
    <CardHeader className="pb-3">
      {title && <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />}
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className={`h-[${height}px] w-full rounded`} />
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-4">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
      </div>
    </CardContent>
  </Card>
)

const ChartErrorBoundary = ({ children, fallbackHeight }: { 
  children: React.ReactNode
  fallbackHeight: number 
}) => {
  return (
    <Card className="border-0.5 border-red-200 bg-red-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span>Error cargando gráfico</span>
        </div>
        <div className={`h-[${fallbackHeight}px] bg-red-100 rounded mt-4 flex items-center justify-center`}>
          <span className="text-red-600 text-sm">Gráfico no disponible</span>
        </div>
      </CardContent>
    </Card>
  )
}

export const LazyChart = memo(({ 
  children, 
  title, 
  description, 
  height = 200,
  fallbackHeight = 200 
}: LazyChartProps) => {
  return (
    <Suspense fallback={<ChartSkeleton height={height} title={title} />}>
      <ChartErrorBoundary fallbackHeight={fallbackHeight}>
        {children}
      </ChartErrorBoundary>
    </Suspense>
  )
})

LazyChart.displayName = 'LazyChart'
