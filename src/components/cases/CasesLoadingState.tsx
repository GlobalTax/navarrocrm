import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function CasesLoadingState() {
  return (
    <div className="space-y-6">
      {/* Stats skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 bg-background border-[0.5px] border-border rounded-[10px] shadow-sm">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-[6px]" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16 rounded-[4px]" />
                <Skeleton className="h-6 w-8 rounded-[4px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters skeleton */}
      <Card className="bg-background border-[0.5px] border-border rounded-[10px] shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <Skeleton className="h-10 flex-1 max-w-sm rounded-[10px]" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-40 rounded-[10px]" />
              <Skeleton className="h-10 w-48 rounded-[10px]" />
              <Skeleton className="h-10 w-48 rounded-[10px]" />
              <Skeleton className="h-10 w-32 rounded-[10px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card className="bg-background border-[0.5px] border-border rounded-[10px] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-20 rounded-[4px]" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-16 rounded-[4px]" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-20 rounded-[4px]" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-24 rounded-[4px]" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-16 rounded-[4px]" />
                </th>
                <th className="text-right p-4">
                  <Skeleton className="h-4 w-20 rounded-[4px]" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className={`border-b-[0.5px] border-border ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                  <td className="p-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48 rounded-[4px]" />
                      <Skeleton className="h-3 w-32 rounded-[4px]" />
                    </div>
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-16 rounded-[10px]" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-24 rounded-[4px]" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-32 rounded-[4px]" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-20 rounded-[4px]" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-8 rounded-[6px]" />
                      <Skeleton className="h-8 w-8 rounded-[6px]" />
                      <Skeleton className="h-8 w-8 rounded-[6px]" />
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