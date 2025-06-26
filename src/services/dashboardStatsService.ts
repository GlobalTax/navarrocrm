
import { supabase } from '@/integrations/supabase/client'
import { DashboardStats } from '@/types/dashboardTypes'

// Función para validar si un string es un UUID válido
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export const getDashboardStatsFallback = async (orgId: string): Promise<DashboardStats> => {
  // Si el UUID no es válido, retornar datos mock
  if (!isValidUUID(orgId)) {
    console.log('📊 Fallback: UUID inválido, retornando datos mock')
    return {
      totalCases: 12,
      activeCases: 8,
      totalContacts: 25,
      totalTimeEntries: 48,
      totalBillableHours: 156.5,
      totalNonBillableHours: 32.25,
      thisMonthCases: 3,
      thisMonthContacts: 5,
      thisMonthHours: 42.75,
    }
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  try {
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
  } catch (error) {
    console.error('❌ Error en fallback de estadísticas:', error)
    // Si todo falla, retornar datos por defecto
    return {
      totalCases: 0,
      activeCases: 0,
      totalContacts: 0,
      totalTimeEntries: 0,
      totalBillableHours: 0,
      totalNonBillableHours: 0,
      thisMonthCases: 0,
      thisMonthContacts: 0,
      thisMonthHours: 0,
    }
  }
}
