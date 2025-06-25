
import { supabase } from '@/integrations/supabase/client'
import { DashboardStats } from '@/types/dashboardTypes'

export const getDashboardStatsFallback = async (orgId: string): Promise<DashboardStats> => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Consultas paralelas para mejor performance
  const [casesResult, contactsResult, timeEntriesResult] = await Promise.all([
    supabase
      .from('cases')
      .select('id, status, created_at')
      .eq('org_id', orgId),
    supabase
      .from('contacts')
      .select('id, created_at')
      .eq('org_id', orgId),
    supabase
      .from('time_entries')
      .select('duration_minutes, is_billable, created_at')
      .eq('org_id', orgId)
  ])

  if (casesResult.error) throw casesResult.error
  if (contactsResult.error) throw contactsResult.error
  if (timeEntriesResult.error) throw timeEntriesResult.error

  const cases = casesResult.data || []
  const contacts = contactsResult.data || []
  const timeEntries = timeEntriesResult.data || []

  // Calcular estadísticas
  const totalCases = cases.length
  const activeCases = cases.filter(c => c.status === 'open').length
  const totalContacts = contacts.length
  const totalTimeEntries = timeEntries.length

  const totalBillableHours = timeEntries
    .filter(te => te.is_billable)
    .reduce((sum, te) => sum + (te.duration_minutes / 60), 0)

  const totalNonBillableHours = timeEntries
    .filter(te => !te.is_billable)
    .reduce((sum, te) => sum + (te.duration_minutes / 60), 0)

  const thisMonthCases = cases.filter(c => 
    new Date(c.created_at) >= startOfMonth
  ).length

  const thisMonthContacts = contacts.filter(c => 
    new Date(c.created_at) >= startOfMonth
  ).length

  const thisMonthHours = timeEntries
    .filter(te => new Date(te.created_at) >= startOfMonth)
    .reduce((sum, te) => sum + (te.duration_minutes / 60), 0)

  return {
    totalCases,
    activeCases,
    totalContacts,
    totalTimeEntries,
    totalBillableHours: Math.round(totalBillableHours * 100) / 100,
    totalNonBillableHours: Math.round(totalNonBillableHours * 100) / 100,
    thisMonthCases,
    thisMonthContacts,
    thisMonthHours: Math.round(thisMonthHours * 100) / 100,
  }
}
