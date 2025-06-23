
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface TimelineEvent {
  id: string
  date: string
  type: 'proposal' | 'case' | 'note' | 'status_change'
  title: string
  description?: string
  status?: string
  amount?: number
}

export const useClientTimeline = (clientId: string) => {
  const { user } = useApp()

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['client-timeline', clientId, user?.org_id],
    queryFn: async () => {
      if (!clientId || !user?.org_id) return []

      const events: TimelineEvent[] = []

      // Obtener propuestas
      const { data: proposals } = await supabase
        .from('proposals')
        .select('id, title, status, total_amount, created_at, accepted_at')
        .eq('contact_id', clientId)
        .eq('org_id', user.org_id)

      proposals?.forEach(proposal => {
        events.push({
          id: `proposal-${proposal.id}`,
          date: proposal.created_at,
          type: 'proposal',
          title: `Propuesta creada: ${proposal.title}`,
          status: proposal.status,
          amount: proposal.total_amount
        })

        if (proposal.accepted_at) {
          events.push({
            id: `proposal-accepted-${proposal.id}`,
            date: proposal.accepted_at,
            type: 'proposal',
            title: `Propuesta aceptada: ${proposal.title}`,
            status: 'won',
            amount: proposal.total_amount
          })
        }
      })

      // Obtener casos
      const { data: cases } = await supabase
        .from('cases')
        .select('id, title, status, created_at, date_closed')
        .eq('contact_id', clientId)
        .eq('org_id', user.org_id)

      cases?.forEach(case_ => {
        events.push({
          id: `case-${case_.id}`,
          date: case_.created_at,
          type: 'case',
          title: `Caso abierto: ${case_.title}`,
          status: case_.status
        })

        if (case_.date_closed) {
          events.push({
            id: `case-closed-${case_.id}`,
            date: case_.date_closed,
            type: 'case',
            title: `Caso cerrado: ${case_.title}`,
            status: 'closed'
          })
        }
      })

      // Obtener notas recientes
      const { data: notes } = await supabase
        .from('contact_notes')
        .select('id, title, created_at, note_type')
        .eq('contact_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10)

      notes?.forEach(note => {
        events.push({
          id: `note-${note.id}`,
          date: note.created_at,
          type: 'note',
          title: `Nota añadida: ${note.title}`,
          description: note.note_type
        })
      })

      // Ordenar por fecha descendente
      return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    enabled: !!clientId && !!user?.org_id
  })

  return {
    timeline,
    isLoading
  }
}
