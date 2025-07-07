import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const UserTableSkeleton = () => {
  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-muted rounded-[10px]">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-10 w-10 rounded-[10px]" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-5 w-16 rounded-[10px]" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-[10px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}