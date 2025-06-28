
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock } from 'lucide-react'
import { useCaseTimeline } from '@/hooks/useCaseTimeline'
import { CaseTimelineEvent } from './CaseTimelineEvent'

interface CaseTimelineProps {
  caseId: string
}

export const CaseTimeline = ({ caseId }: CaseTimelineProps) => {
  const { timeline, isLoading, error } = useCaseTimeline(caseId)

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline del Expediente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error al cargar el timeline
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline del Expediente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay actividad registrada para este expediente</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {timeline.map((event) => (
                <CaseTimelineEvent key={event.id} event={event} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
