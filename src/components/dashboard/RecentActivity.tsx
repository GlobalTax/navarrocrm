
import { useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { createLogger } from '@/utils/logger'

const logger = createLogger('RecentActivity')

export const RecentActivity = memo(() => {
  const { user } = useApp()

  const { data: recentContacts = [] } = useQuery({
    queryKey: ['recent-contacts', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        logger.error('Error fetching recent contacts:', error)
        return []
      }
      
      return data || []
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  })

  const { data: recentCases = [] } = useQuery({
    queryKey: ['recent-cases', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          created_at,
          contact:contacts(name)
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        logger.error('Error fetching recent cases:', error)
        return []
      }
      
      return data || []
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  })

  const { data: recentTimeEntries = [] } = useQuery({
    queryKey: ['recent-time-entries', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          description,
          duration_minutes,
          created_at,
          case:cases(
            title,
            contact:contacts(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        logger.error('Error fetching recent time entries:', error)
        return []
      }
      
      return data || []
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  })

  const allActivity = useMemo(() => [
    ...recentContacts.map(contact => ({
      type: 'contact' as const,
      id: contact.id,
      title: contact.name,
      subtitle: 'Nuevo contacto',
      createdAt: contact.created_at,
      icon: User
    })),
    ...recentCases.map(case_ => ({
      type: 'case' as const,
      id: case_.id,
      title: case_.title,
      subtitle: case_.contact?.name || 'Sin cliente',
      createdAt: case_.created_at,
      icon: FileText
    })),
    ...recentTimeEntries.map(entry => ({
      type: 'time' as const,
      id: entry.id,
      title: entry.description || 'Entrada de tiempo',
      subtitle: entry.case?.contact?.name || 'Sin caso',
      createdAt: entry.created_at,
      duration: entry.duration_minutes,
      icon: Clock
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10), [recentContacts, recentCases, recentTimeEntries])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allActivity.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No hay actividad reciente
            </div>
          ) : (
            allActivity.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{activity.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type === 'contact' && 'Contacto'}
                        {activity.type === 'case' && 'Caso'}
                        {activity.type === 'time' && 'Tiempo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.subtitle}
                      {activity.type === 'time' && activity.duration && ` • ${Math.round(activity.duration / 60)}h ${activity.duration % 60}m`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { 
                      addSuffix: true,
                      locale: es 
                    })}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
})

RecentActivity.displayName = 'RecentActivity'
