
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, CheckCircle, Plus, FileText, MessageSquare } from 'lucide-react'
import { TimelineEvent } from '@/hooks/useCaseTimeline'

interface CaseTimelineEventProps {
  event: TimelineEvent
}

const getIcon = (iconName: string) => {
  const icons = {
    Clock,
    CheckCircle,
    Plus,
    FileText,
    MessageSquare
  }
  const Icon = icons[iconName as keyof typeof icons] || Clock
  return Icon
}

export const CaseTimelineEvent = ({ event }: CaseTimelineEventProps) => {
  const Icon = getIcon(event.icon)
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center ${event.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            {event.user_name && (
              <p className="text-xs text-gray-500 mt-1">por {event.user_name}</p>
            )}
          </div>
          <time className="text-xs text-gray-500 flex-shrink-0 ml-4">
            {formatDistanceToNow(new Date(event.timestamp), { 
              addSuffix: true, 
              locale: es 
            })}
          </time>
        </div>
      </div>
    </div>
  )
}
