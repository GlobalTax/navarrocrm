import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, MailOpen, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface EmailMessage {
  id: string
  subject: string
  from_address: string
  received_datetime: string
  is_read: boolean
  has_attachments: boolean
  body_text?: string
}

export function RecentEmailsList() {
  const { user } = useApp()

  const { data: emails, isLoading } = useQuery({
    queryKey: ['recent-emails', user?.org_id],
    queryFn: async (): Promise<EmailMessage[]> => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('email_messages')
        .select('id, subject, from_address, received_datetime, is_read, has_attachments, body_text')
        .eq('org_id', user.org_id)
        .eq('message_type', 'received')
        .order('received_datetime', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 2 // 2 minutos
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay emails recientes</p>
        <p className="text-sm">Los emails aparecerán aquí una vez sincronices con Outlook</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
            !email.is_read ? 'bg-blue-50 border-blue-200' : ''
          }`}
        >
          <div className="flex-shrink-0">
            {email.is_read ? (
              <MailOpen className="h-5 w-5 text-gray-400" />
            ) : (
              <Mail className="h-5 w-5 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className={`text-sm font-medium truncate ${!email.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
                {email.subject || 'Sin asunto'}
              </p>
              {!email.is_read && (
                <Badge variant="secondary" className="text-xs">
                  Nuevo
                </Badge>
              )}
              {email.has_attachments && (
                <Badge variant="outline" className="text-xs">
                  📎
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{email.from_address}</span>
              <Clock className="h-3 w-3 ml-2" />
              <span>
                {formatDistanceToNow(new Date(email.received_datetime), {
                  addSuffix: true,
                  locale: es
                })}
              </span>
            </div>

            {email.body_text && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {email.body_text.slice(0, 100)}...
              </p>
            )}
          </div>

          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                // TODO: Navegar al thread del email
                console.log('Ver email:', email.id)
              }}
            >
              Ver
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}