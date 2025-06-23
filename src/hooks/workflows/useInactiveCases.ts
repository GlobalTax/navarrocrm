
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { InactiveCase } from './types'

export const useInactiveCases = () => {
  const { user } = useApp()

  const detectInactiveCases = async (): Promise<InactiveCase[] | undefined> => {
    if (!user?.org_id) return

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: inactiveCases } = await supabase
      .from('cases')
      .select(`
        *,
        tasks:tasks(created_at),
        contact:contacts(name)
      `)
      .eq('org_id', user.org_id)
      .eq('status', 'open')
      .not('tasks.created_at', 'gte', thirtyDaysAgo)

    return inactiveCases?.map(case_ => ({
      caseId: case_.id,
      title: case_.title,
      clientName: case_.contact?.name,  // Changed from client to contact
      daysSinceActivity: Math.floor((Date.now() - new Date(case_.date_opened).getTime()) / (1000 * 60 * 60 * 24)),
      suggestions: [
        'Contactar con el cliente para actualización',
        'Revisar el estado del expediente',
        'Programar reunión de seguimiento'
      ]
    }))
  }

  return {
    detectInactiveCases
  }
}
