import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const UserMetricsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border-0.5 border-black rounded-[10px]">
          <CardContent className="p-4 text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-4 w-12 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}