
import { supabase } from '@/integrations/supabase/client'

export const createPracticeAreas = async (orgId: string) => {
  const practiceAreas = [
    { name: 'Derecho Civil', description: 'Contratos, responsabilidad civil, derecho de familia', org_id: orgId },
    { name: 'Derecho Mercantil', description: 'Sociedades, concursos, derecho comercial', org_id: orgId },
    { name: 'Derecho Laboral', description: 'Contratos laborales, despidos, seguridad social', org_id: orgId },
    { name: 'Derecho Penal', description: 'Defensa penal, procedimientos penales', org_id: orgId },
    { name: 'Derecho Tributario', description: 'Asesoría fiscal, procedimientos tributarios', org_id: orgId }
  ]

  await supabase
    .from('practice_areas')
    .insert(practiceAreas)
}
