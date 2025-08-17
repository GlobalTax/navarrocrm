import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  AlertTriangle, 
  Info, 
  Clock, 
  RefreshCw,
  Eye,
  Lock,
  User,
  Database
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface SecurityEvent {
  id: string
  event_type: string
  event_name: string
  user_id: string | null
  session_id: string
  page_url: string
  event_data: any
  timestamp: string
}

export const SecurityEventsList = () => {
  const { user } = useApp()
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSecurityEvents()
  }, [user?.org_id])

  const fetchSecurityEvents = async () => {
    if (!user?.org_id) return

    try {
      setIsLoading(true)
      
      // Fetch security-related analytics events
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('org_id', user.org_id)
        .in('event_type', [
          'auth_login',
          'auth_logout', 
          'auth_error',
          'data_access',
          'permission_check',
          'role_change',
          'security_scan'
        ])
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error

      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching security events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'auth_login':
      case 'auth_logout':
        return <User className="h-4 w-4" />
      case 'auth_error':
        return <AlertTriangle className="h-4 w-4" />
      case 'data_access':
        return <Database className="h-4 w-4" />
      case 'permission_check':
        return <Lock className="h-4 w-4" />
      case 'role_change':
        return <Shield className="h-4 w-4" />
      case 'security_scan':
        return <Eye className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getEventSeverity = (eventType: string, eventData: any) => {
    if (eventType === 'auth_error') return 'critical'
    if (eventType === 'permission_check' && eventData?.denied) return 'warning'
    if (eventType === 'role_change') return 'warning'
    return 'info'
  }

  const getEventTitle = (event: SecurityEvent) => {
    const { event_type, event_name, event_data } = event
    
    switch (event_type) {
      case 'auth_login':
        return 'Inicio de sesión exitoso'
      case 'auth_logout':
        return 'Cierre de sesión'
      case 'auth_error':
        return `Error de autenticación: ${event_data?.error || 'Credenciales inválidas'}`
      case 'data_access':
        return `Acceso a datos: ${event_data?.resource || event_name}`
      case 'permission_check':
        return `Verificación de permisos: ${event_data?.permission || event_name}`
      case 'role_change':
        return `Cambio de rol detectado`
      case 'security_scan':
        return 'Escaneo de seguridad ejecutado'
      default:
        return event_name || 'Evento de seguridad'
    }
  }

  const getEventDescription = (event: SecurityEvent) => {
    const { event_type, event_data, page_url } = event
    
    let description = `Página: ${page_url}`
    
    if (event_data) {
      if (event_type === 'auth_error' && event_data.error) {
        description += ` • Error: ${event_data.error}`
      }
      if (event_data.user_agent) {
        const ua = event_data.user_agent
        const browser = ua.includes('Chrome') ? 'Chrome' : 
                        ua.includes('Firefox') ? 'Firefox' : 
                        ua.includes('Safari') ? 'Safari' : 'Unknown'
        description += ` • Navegador: ${browser}`
      }
      if (event_data.ip_address) {
        description += ` • IP: ${event_data.ip_address}`
      }
    }
    
    return description
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>
      case 'warning':
        return <Badge variant="secondary">Alerta</Badge>
      case 'info':
      default:
        return <Badge variant="outline">Info</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay eventos de seguridad recientes</h3>
        <p className="text-muted-foreground mb-4">
          Los eventos de seguridad aparecerán aquí cuando se detecten actividades relevantes.
        </p>
        <Button onClick={fetchSecurityEvents} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {events.length} eventos recientes
        </p>
        <Button onClick={fetchSecurityEvents} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {events.map((event) => {
        const severity = getEventSeverity(event.event_type, event.event_data)
        
        return (
          <Card key={event.id} className="p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event.event_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">
                    {getEventTitle(event)}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(severity)}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(event.timestamp), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {getEventDescription(event)}
                </p>
                
                {event.session_id && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Sesión: {event.session_id.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}