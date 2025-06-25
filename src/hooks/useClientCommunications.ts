
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface ClientCommunication {
  id: string
  type: 'email' | 'call' | 'meeting' | 'note'
  subject: string
  content?: string
  direction: 'inbound' | 'outbound'
  date: string
  participants: string[]
  status: string
  thread_id?: string
  duration_minutes?: number
  location?: string
  outcome?: string
}

export const useClientCommunications = (clientId: string) => {
  const { user } = useApp()

  const { data: communications = [], isLoading, refetch } = useQuery({
    queryKey: ['client-communications', clientId, user?.org_id],
    queryFn: async () => {
      if (!clientId || !user?.org_id) return []

      const events: ClientCommunication[] = []

      // Obtener threads de email
      const { data: emailThreads } = await supabase
        .from('email_threads')
        .select('*')
        .eq('contact_id', clientId)
        .eq('org_id', user.org_id)
        .order('last_message_at', { ascending: false })

      emailThreads?.forEach(thread => {
        events.push({
          id: `email-${thread.id}`,
          type: 'email',
          subject: thread.thread_subject,
          direction: 'outbound', // Por defecto, se puede mejorar con más lógica
          date: thread.last_message_at || thread.created_at,
          participants: thread.participants || [],
          status: thread.status || 'completed',
          thread_id: thread.outlook_thread_id
        })
      })

      // Obtener eventos de calendario (calls/meetings)
      const { data: calendarEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('contact_id', clientId)
        .eq('org_id', user.org_id)
        .order('start_datetime', { ascending: false })

      calendarEvents?.forEach(event => {
        const duration = event.end_datetime && event.start_datetime 
          ? Math.round((new Date(event.end_datetime).getTime() - new Date(event.start_datetime).getTime()) / (1000 * 60))
          : undefined

        events.push({
          id: `calendar-${event.id}`,
          type: event.event_type === 'meeting' ? 'meeting' : 'call',
          subject: event.title,
          content: event.description,
          direction: 'outbound',
          date: event.start_datetime,
          participants: event.attendees_emails || [],
          status: event.status,
          duration_minutes: duration,
          location: event.location
        })
      })

      // Obtener notas de contacto como comunicaciones
      const { data: notes } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20)

      notes?.forEach(note => {
        events.push({
          id: `note-${note.id}`,
          type: 'note',
          subject: note.title,
          content: note.content,
          direction: 'outbound',
          date: note.created_at,
          participants: [],
          status: 'completed'
        })
      })

      // Ordenar por fecha descendente
      return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    enabled: !!clientId && !!user?.org_id
  })

  // Métricas calculadas
  const totalCommunications = communications.length
  const emailsCount = communications.filter(c => c.type === 'email').length
  const callsCount = communications.filter(c => c.type === 'call').length
  const meetingsCount = communications.filter(c => c.type === 'meeting').length
  const notesCount = communications.filter(c => c.type === 'note').length

  const lastCommunication = communications[0]
  const totalCallDuration = communications
    .filter(c => c.type === 'call' && c.duration_minutes)
    .reduce((sum, c) => sum + (c.duration_minutes || 0), 0)

  return {
    communications,
    isLoading,
    refetch,
    metrics: {
      totalCommunications,
      emailsCount,
      callsCount,
      meetingsCount,
      notesCount,
      totalCallDuration,
      lastCommunication
    }
  }
}
