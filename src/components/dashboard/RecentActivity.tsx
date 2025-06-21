
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Clock, 
  DollarSign,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ActivityItem {
  id: string
  type: 'client' | 'case' | 'time' | 'invoice' | 'meeting'
  title: string
  description: string
  timestamp: Date
  user: string
}

// Datos de ejemplo
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'client',
    title: 'Nuevo cliente registrado',
    description: 'García Construcciones S.L.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    user: 'María López'
  },
  {
    id: '2',
    type: 'time',
    title: 'Tiempo registrado',
    description: '2.5 horas en revisión contractual',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
    user: 'Juan Pérez'
  },
  {
    id: '3',
    type: 'case',
    title: 'Caso actualizado',
    description: 'Expediente #2024-001 - Documentos añadidos',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    user: 'Ana Martín'
  },
  {
    id: '4',
    type: 'meeting',
    title: 'Reunión programada',
    description: 'Cliente Rodríguez - Mañana 10:00',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
    user: 'Carlos Ruiz'
  }
]

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'client': return Users
    case 'case': return FileText
    case 'time': return Clock
    case 'invoice': return DollarSign
    case 'meeting': return Calendar
  }
}

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'client': return 'bg-blue-100 text-blue-700'
    case 'case': return 'bg-green-100 text-green-700'
    case 'time': return 'bg-orange-100 text-orange-700'
    case 'invoice': return 'bg-purple-100 text-purple-700'
    case 'meeting': return 'bg-indigo-100 text-indigo-700'
  }
}

export const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivities.map((activity) => {
          const Icon = getActivityIcon(activity.type)
          return (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {activity.user}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
