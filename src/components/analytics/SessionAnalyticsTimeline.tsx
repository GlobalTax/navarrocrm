
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, User, Eye, MousePointer2, AlertTriangle } from 'lucide-react'
import { AnalyticsWidget } from './AnalyticsWidget'

interface SessionEvent {
  id: string
  type: 'page_view' | 'click' | 'form_submit' | 'error' | 'scroll'
  timestamp: Date
  page: string
  details: string
  duration?: number
}

interface UserSession {
  sessionId: string
  userId?: string
  startTime: Date
  endTime?: Date
  totalDuration: number
  pageViews: number
  interactions: number
  errors: number
  events: SessionEvent[]
  userAgent: string
  location?: string
}

export const SessionAnalyticsTimeline: React.FC = () => {
  // Datos simulados de sesiones (en implementación real vendrían de la API)
  const sessions: UserSession[] = [
    {
      sessionId: 'sess_1',
      userId: 'user_123',
      startTime: new Date(Date.now() - 1000 * 60 * 45),
      totalDuration: 45 * 60 * 1000,
      pageViews: 12,
      interactions: 28,
      errors: 1,
      events: [
        {
          id: '1',
          type: 'page_view',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          page: '/dashboard',
          details: 'Dashboard principal',
          duration: 120000
        },
        {
          id: '2',
          type: 'click',
          timestamp: new Date(Date.now() - 1000 * 60 * 43),
          page: '/dashboard',
          details: 'Botón "Ver contactos"'
        },
        {
          id: '3',
          type: 'page_view',
          timestamp: new Date(Date.now() - 1000 * 60 * 42),
          page: '/contacts',
          details: 'Lista de contactos',
          duration: 300000
        }
      ],
      userAgent: 'Chrome 120.0',
      location: 'Madrid, España'
    },
    {
      sessionId: 'sess_2',
      startTime: new Date(Date.now() - 1000 * 60 * 30),
      totalDuration: 30 * 60 * 1000,
      pageViews: 8,
      interactions: 15,
      errors: 0,
      events: [
        {
          id: '4',
          type: 'page_view',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          page: '/cases',
          details: 'Lista de expedientes'
        }
      ],
      userAgent: 'Safari 17.0',
      location: 'Barcelona, España'
    }
  ]

  const getEventIcon = (type: SessionEvent['type']) => {
    switch (type) {
      case 'page_view': return <Eye className="h-3 w-3" />
      case 'click': return <MousePointer2 className="h-3 w-3" />
      case 'form_submit': return <Clock className="h-3 w-3" />
      case 'error': return <AlertTriangle className="h-3 w-3" />
      case 'scroll': return <Clock className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getEventColor = (type: SessionEvent['type']) => {
    switch (type) {
      case 'page_view': return 'text-blue-600 bg-blue-50'
      case 'click': return 'text-green-600 bg-green-50'
      case 'form_submit': return 'text-purple-600 bg-purple-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'scroll': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const totalSessions = sessions.length
  const avgDuration = sessions.reduce((sum, session) => sum + session.totalDuration, 0) / totalSessions
  const totalPageViews = sessions.reduce((sum, session) => sum + session.pageViews, 0)
  const totalInteractions = sessions.reduce((sum, session) => sum + session.interactions, 0)

  return (
    <div className="space-y-6">
      {/* Métricas de sesiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsWidget
          title="Sesiones Activas"
          value={totalSessions}
          icon={<User className="h-4 w-4" />}
          trend="up"
          trendValue={`${totalSessions} sesiones`}
        />
        
        <AnalyticsWidget
          title="Duración Promedio"
          value={formatDuration(avgDuration)}
          icon={<Clock className="h-4 w-4" />}
          trend="up"
          trendValue="Buen engagement"
        />
        
        <AnalyticsWidget
          title="Páginas por Sesión"
          value={(totalPageViews / totalSessions).toFixed(1)}
          icon={<Eye className="h-4 w-4" />}
          trend="up"
          trendValue="Navegación activa"
        />
        
        <AnalyticsWidget
          title="Interacciones Totales"
          value={totalInteractions}
          icon={<MousePointer2 className="h-4 w-4" />}
          trend="up"
          trendValue={`${totalInteractions} clics`}
        />
      </div>

      {/* Timeline de sesiones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <Card key={session.sessionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session.userId ? session.userId.slice(0, 2).toUpperCase() : 'AN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm">
                      {session.userId ? `Usuario ${session.userId.slice(0, 8)}...` : 'Usuario Anónimo'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {session.location} • {session.userAgent}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {formatDuration(session.totalDuration)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Estadísticas de la sesión */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {session.pageViews} páginas
                    </span>
                    <span className="text-muted-foreground">
                      {session.interactions} clics
                    </span>
                    {session.errors > 0 && (
                      <span className="text-red-600">
                        {session.errors} errores
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Hace {Math.floor((Date.now() - session.startTime.getTime()) / 60000)}m
                  </span>
                </div>

                {/* Timeline de eventos */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {session.events.slice(0, 5).map((event, index) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <div className={`p-1 rounded-full ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {event.details}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{event.page}</span>
                          {event.duration && (
                            <span>• {formatDuration(event.duration)}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  ))}
                  {session.events.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver {session.events.length - 5} eventos más
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights de comportamiento */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Comportamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm text-blue-800 mb-2">Páginas Populares</h4>
              <p className="text-xs text-blue-700">
                Dashboard y Contactos son las páginas más visitadas
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-sm text-green-800 mb-2">Tiempo de Engagement</h4>
              <p className="text-xs text-green-700">
                Los usuarios pasan más tiempo en la sección de expedientes
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-sm text-purple-800 mb-2">Patrones de Uso</h4>
              <p className="text-xs text-purple-700">
                Picos de actividad entre 9:00-12:00 y 14:00-17:00
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
