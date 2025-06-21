
import { supabase } from '@/integrations/supabase/client'

export const createTimeEntries = async (orgId: string, users: any[], cases: any[]) => {
  const timeEntries = [
    {
      user_id: users[0].id,
      case_id: cases[0].id,
      duration_minutes: 480, // 8 horas
      description: 'Revisión completa del contrato principal y análisis de cláusulas',
      is_billable: true,
      org_id: orgId
    },
    {
      user_id: users[1].id,
      case_id: cases[1].id,
      duration_minutes: 360, // 6 horas
      description: 'Reunión con cliente y preparación documentación divorcio',
      is_billable: true,
      org_id: orgId
    },
    {
      user_id: users[2].id,
      case_id: cases[3].id,
      duration_minutes: 240, // 4 horas
      description: 'Análisis expediente disciplinario y jurisprudencia aplicable',
      is_billable: true,
      org_id: orgId
    },
    {
      user_id: users[0].id,
      case_id: cases[2].id,
      duration_minutes: 600, // 10 horas
      description: 'Due diligence societario - Revisión de contratos y estatutos',
      is_billable: true,
      org_id: orgId
    },
    {
      user_id: users[1].id,
      case_id: cases[4].id,
      duration_minutes: 420, // 7 horas
      description: 'Planificación fiscal y reunión con asesor fiscal',
      is_billable: true,
      org_id: orgId
    }
  ]

  await supabase
    .from('time_entries')
    .insert(timeEntries)
}
