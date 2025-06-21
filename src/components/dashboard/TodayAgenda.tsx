
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, AlertTriangle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AgendaItem {
  id: string
  title: string
  time: string
  type: 'meeting' | 'deadline' | 'task' | 'court'
  priority: 'high' | 'medium' | 'low'
  client?: string
}

// Datos de ejemplo - en producción vendrían de la base de datos
const mockAgendaItems: AgendaItem[] = [
  {
    id: '1',
    title: 'Reunión con Cliente García',
    time: '09:00',
    type: 'meeting',
    priority: 'high',
    client: 'García S.L.'
  },
  {
    id: '2',
    title: 'Plazo presentación recursos',
    time: '14:00',
    type: 'deadline',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Revisar contrato López',
    time: '16:30',
    type: 'task',
    priority: 'medium',
    client: 'López & Asociados'
  },
  {
    id: '4',
    title: 'Vista oral Juzgado #3',
    time: '11:00',
    type: 'court',
    priority: 'high'
  }
]

const getTypeIcon = (type: AgendaItem['type']) => {
  switch (type) {
    case 'meeting': return <Calendar className="h-4 w-4" />
    case 'deadline': return <AlertTriangle className="h-4 w-4" />
    case 'task': return <Clock className="h-4 w-4" />
    case 'court': return <AlertTriangle className="h-4 w-4" />
  }
}

const getTypeColor = (type: AgendaItem['type']) => {
  switch (type) {
    case 'meeting': return 'bg-blue-100 text-blue-800'
    case 'deadline': return 'bg-red-100 text-red-800'
    case 'task': return 'bg-green-100 text-green-800'
    case 'court': return 'bg-purple-100 text-purple-800'
  }
}

const getPriorityColor = (priority: AgendaItem['priority']) => {
  switch (priority) {
    case 'high': return 'border-l-red-500'
    case 'medium': return 'border-l-yellow-500'
    case 'low': return 'border-l-green-500'
  }
}

export const TodayAgenda = () => {
  const today = new Date()
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Agenda de Hoy
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {format(today, 'EEEE, d MMMM', { locale: es })}
          </span>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAgendaItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay eventos programados para hoy</p>
          </div>
        ) : (
          mockAgendaItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <Badge variant="secondary" className={`text-xs ${getTypeColor(item.type)}`}>
                      {item.type === 'meeting' && 'Reunión'}
                      {item.type === 'deadline' && 'Plazo'}
                      {item.type === 'task' && 'Tarea'}
                      {item.type === 'court' && 'Juzgado'}
                    </Badge>
                  </div>
                  {item.client && (
                    <p className="text-xs text-muted-foreground">{item.client}</p>
                  )}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {item.time}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
