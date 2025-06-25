
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { Clock, MousePointer, Eye, AlertTriangle, Navigation, User, Activity } from 'lucide-react'
import { Timeline } from '@/components/ui/timeline'

interface SessionEvent {
  id: string
  type: 'page_view' | 'click' | 'error' | 'performance'
  timestamp: string
  data: any
  pageUrl: string
  duration?: number
}

interface SessionTimeline {
  sessionId: string
  userId?: string
  startTime: string
  endTime?: string
  events: SessionEvent[]
  totalDuration: number
  pageViews: number
  interactions: number
  errors: number
}

export const SessionAnalyticsTimeline: React.FC = () => {
  const { user } = useApp()
  const [sessions, setSessions] = useState<SessionTimeline[]>([])
  const [selectedSession, setSelectedSession] = useState<SessionTimeline | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')

  useEffect(() => {
    fetchSessionsData()
  }, [user?.org_id, timeRange])

  const fetchSessionsData = async () => {
    if (!user?.org_id) return

    try {
      const now = new Date()
      const timeRanges = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
      
      const startTime = timeRanges[timeRange as keyof typeof timeRanges]

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .eq('org_id', user.org_id)
        .gte('start_time', startTime.toISOString())
        .order('start_time', { ascending: false })
        .limit(20)

      if (sessionsError) throw sessionsError

      if (!sessionsData || sessionsData.length === 0) {
        setSessions([])
        setSelectedSession(null)
        setIsLoading(false)
        return
      }

      // For each session, fetch all related events
      const sessionTimelines: SessionTimeline[] = []

      for (const session of sessionsData) {
        const sessionId = session.session_id

        // Fetch events for this session
        const [eventsResult, interactionsResult, errorsResult, performanceResult] = await Promise.all([
          supabase
            .from('analytics_events')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: true }),
          
          supabase
            .from('analytics_interactions')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: true }),
          
          supabase
            .from('analytics_errors')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: true }),
          
          supabase
            .from('analytics_performance')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: true })
        ])

        // Combine all events into a timeline
        const allEvents: SessionEvent[] = []

        // Add page view events
        eventsResult.data?.forEach(event => {
          if (event.event_type === 'navigation' && event.event_name === 'page_view') {
            allEvents.push({
              id: event.id,
              type: 'page_view',
              timestamp: event.timestamp,
              data: event.event_data,
              pageUrl: event.page_url
            })
          }
        })

        // Add interaction events
        interactionsResult.data?.forEach(interaction => {
          allEvents.push({
            id: interaction.id,
            type: 'click',
            timestamp: interaction.timestamp,
            data: interaction.interaction_data,
            pageUrl: interaction.page_url
          })
        })

        // Add error events
        errorsResult.data?.forEach(error => {
          allEvents.push({
            id: error.id,
            type: 'error',
            timestamp: error.timestamp,
            data: {
              message: error.error_message,
              type: error.error_type,
              stack: error.error_stack
            },
            pageUrl: error.page_url
          })
        })

        // Add performance events
        performanceResult.data?.forEach(perf => {
          allEvents.push({
            id: perf.id,
            type: 'performance',
            timestamp: perf.timestamp,
            data: {
              lcp: perf.largest_contentful_paint,
              fid: perf.first_input_delay,
              cls: perf.cumulative_layout_shift,
              loadTime: perf.load_time
            },
            pageUrl: perf.page_url
          })
        })

        // Sort events by timestamp
        allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        // Calculate durations between events
        for (let i = 0; i < allEvents.length - 1; i++) {
          const currentTime = new Date(allEvents[i].timestamp).getTime()
          const nextTime = new Date(allEvents[i + 1].timestamp).getTime()
          allEvents[i].duration = nextTime - currentTime
        }

        const sessionTimeline: SessionTimeline = {
          sessionId: session.session_id,
          userId: session.user_id,
          startTime: session.start_time,
          endTime: session.end_time,
          events: allEvents,
          totalDuration: session.end_time 
            ? new Date(session.end_time).getTime() - new Date(session.start_time).getTime()
            : Date.now() - new Date(session.start_time).getTime(),
          pageViews: allEvents.filter(e => e.type === 'page_view').length,
          interactions: allEvents.filter(e => e.type === 'click').length,
          errors: allEvents.filter(e => e.type === 'error').length
        }

        sessionTimelines.push(sessionTimeline)
      }

      setSessions(sessionTimelines)
      if (sessionTimelines.length > 0 && !selectedSession) {
        setSelectedSession(sessionTimelines[0])
      }
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching session data:', error)
      setIsLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffHours > 0) return `hace ${diffHours}h`
    if (diffMins > 0) return `hace ${diffMins}m`
    return 'ahora'
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="h-4 w-4 text-blue-500" />
      case 'click': return <MousePointer className="h-4 w-4 text-green-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'performance': return <Activity className="h-4 w-4 text-purple-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'page_view': return 'bg-blue-50 border-blue-200'
      case 'click': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'performance': return 'bg-purple-50 border-purple-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getPageFromUrl = (url: string) => {
    try {
      return new URL(url).pathname
    } catch {
      return url
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Timeline de Sesiones</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1 hora</SelectItem>
            <SelectItem value="24h">24 horas</SelectItem>
            <SelectItem value="7d">7 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-600 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.sessionId === session.sessionId
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {session.userId ? `Usuario ${session.userId.slice(0, 8)}` : 'Anónimo'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(session.startTime)}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{formatDuration(session.totalDuration)}</span>
                    <span>{session.pageViews} páginas</span>
                    <span>{session.interactions} clicks</span>
                    {session.errors > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {session.errors} errores
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay sesiones para el período seleccionado
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Timeline de Sesión
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {selectedSession.userId ? `Usuario ${selectedSession.userId.slice(0, 8)}` : 'Anónimo'}
                  </span>
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Duración: {formatDuration(selectedSession.totalDuration)}</span>
                  <span>Eventos: {selectedSession.events.length}</span>
                  <span>Comenzó: {new Date(selectedSession.startTime).toLocaleString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-600 overflow-y-auto">
                  {selectedSession.events.map((event, index) => (
                    <div key={event.id} className="relative">
                      {index < selectedSession.events.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                      )}
                      
                      <div className={`flex items-start space-x-3 p-3 rounded-lg border ${getEventColor(event.type)}`}>
                        <div className="flex-shrink-0 p-2 bg-white rounded-full border">
                          {getEventIcon(event.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {event.type}
                              </Badge>
                              <span className="text-sm font-medium">
                                {getPageFromUrl(event.pageUrl)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                              {event.duration && (
                                <span className="ml-2">
                                  (+{formatDuration(event.duration)})
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-1 text-sm text-muted-foreground">
                            {event.type === 'page_view' && (
                              <span>Vista de página</span>
                            )}
                            {event.type === 'click' && event.data.tagName && (
                              <span>
                                Click en {event.data.tagName.toLowerCase()}
                                {event.data.text && `: "${event.data.text.slice(0, 50)}"`}
                              </span>
                            )}
                            {event.type === 'error' && (
                              <span className="text-red-600">
                                Error: {event.data.message}
                              </span>
                            )}
                            {event.type === 'performance' && (
                              <div className="space-y-1">
                                {event.data.lcp && (
                                  <div>LCP: {Math.round(event.data.lcp)}ms</div>
                                )}
                                {event.data.fid && (
                                  <div>FID: {Math.round(event.data.fid)}ms</div>
                                )}
                                {event.data.loadTime && (
                                  <div>Load Time: {Math.round(event.data.loadTime)}ms</div>
                                )}
                              </div>
                            )}
                          </div>

                          {event.data && event.type === 'error' && event.data.stack && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-muted-foreground">
                                Ver stack trace
                              </summary>
                              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                {event.data.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {selectedSession.events.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay eventos registrados para esta sesión
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Selecciona una sesión para ver su timeline
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
