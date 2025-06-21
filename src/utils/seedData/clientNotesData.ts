
import { supabase } from '@/integrations/supabase/client'

export const createClientNotes = async (orgId: string, clients: any[], users: any[]) => {
  const clientNotes = [
    {
      client_id: clients[0].id,
      title: 'Perfil empresarial',
      content: 'Empresa familiar en segunda generación. Muy orientados al detalle y cumplimiento de plazos. Prefieren comunicación por email. Facturación mensual.',
      note_type: 'business',
      user_id: users[0].id,
      is_private: false,
      org_id: orgId
    },
    {
      client_id: clients[1].id,
      title: 'Situación personal',
      content: 'Cliente muy afectada por el proceso. Necesita explicaciones detalladas y acompañamiento emocional. Hijos menores de 8 y 12 años.',
      note_type: 'personal',
      user_id: users[1].id,
      is_private: true,
      org_id: orgId
    },
    {
      client_id: clients[2].id,
      title: 'Estructura corporativa',
      content: 'Grupo empresarial complejo con múltiples participadas. CEO muy involucrado en decisiones legales. Presupuestos amplios para asesoramiento.',
      note_type: 'business',
      user_id: users[0].id,
      is_private: false,
      org_id: orgId
    }
  ]

  await supabase
    .from('client_notes')
    .insert(clientNotes)
}
