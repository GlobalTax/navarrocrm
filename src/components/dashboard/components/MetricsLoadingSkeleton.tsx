
import { Card, CardContent } from '@/components/ui/card'

export const MetricsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg" />
              <div className="w-12 h-4 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="w-16 h-8 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-3 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
