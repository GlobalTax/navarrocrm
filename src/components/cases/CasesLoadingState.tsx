import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function CasesLoadingState() {
  return (
    <div className="space-y-6">
      {/* Stats skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <Skeleton className="h-10 flex-1 max-w-sm" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-right p-4">
                  <Skeleton className="h-4 w-20" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                  <td className="p-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}