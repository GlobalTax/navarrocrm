
import { supabase } from '@/integrations/supabase/client'

export const createCalendarEvents = async (orgId: string, clients: any[], cases: any[], users: any[]) => {
  const calendarEvents = [
    {
      title: 'Vista oral - Constructora Mediterráneo',
      description: 'Comparecencia en Audiencia Provincial de Valencia - Sala 2ª',
      start_datetime: '2024-06-24T10:00:00.000Z',
      end_datetime: '2024-06-24T12:00:00.000Z',
      event_type: 'hearing',
      location: 'Audiencia Provincial de Valencia, Sala 2ª',
      client_id: clients[0].id,
      case_id: cases[0].id,
      created_by: users[0].id,
      reminder_minutes: 60,
      org_id: orgId
    },
    {
      title: 'Reunión cliente - Divorcio López',
      description: 'Revisión propuesta convenio regulador y documentación',
      start_datetime: '2024-06-26T16:00:00.000Z',
      end_datetime: '2024-06-26T17:30:00.000Z',
      event_type: 'meeting',
      location: 'Despacho - Sala de reuniones',
      client_id: clients[1].id,
      case_id: cases[1].id,
      created_by: users[1].id,
      reminder_minutes: 30,
      org_id: orgId
    },
    {
      title: 'Junta General - Gourmet Group',
      description: 'Asistencia a Junta General Extraordinaria para reestructuración',
      start_datetime: '2024-07-15T11:00:00.000Z',
      end_datetime: '2024-07-15T13:00:00.000Z',
      event_type: 'meeting',
      location: 'Sede social del cliente',
      client_id: clients[2].id,
      case_id: cases[2].id,
      created_by: users[0].id,
      reminder_minutes: 120,
      org_id: orgId
    },
    {
      title: 'Juicio - Despido Fernández',
      description: 'Acto de juicio por despido improcedente',
      start_datetime: '2024-07-08T09:30:00.000Z',
      end_datetime: '2024-07-08T11:00:00.000Z',
      event_type: 'hearing',
      location: 'Juzgado de lo Social nº 2 - Sevilla',
      client_id: clients[3].id,
      case_id: cases[3].id,
      created_by: users[2].id,
      reminder_minutes: 90,
      org_id: orgId
    }
  ]

  await supabase
    .from('calendar_events')
    .insert(calendarEvents)
}
