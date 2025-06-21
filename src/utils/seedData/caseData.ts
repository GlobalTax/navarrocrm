
import { supabase } from '@/integrations/supabase/client'
import type { SeedCase } from './types'

export const createCases = async (orgId: string, clients: any[]) => {
  const cases: SeedCase[] = [
    {
      title: 'Reclamación contractual - Constructora Mediterráneo',
      description: 'Incumplimiento de contrato de obra pública. Reclamación de daños y perjuicios por retraso en la entrega.',
      client_id: clients[0].id,
      practice_area: 'Derecho Civil',
      status: 'open',
      matter_number: 'CV-2024-001',
      estimated_budget: 15000,
      billing_method: 'hourly',
      org_id: orgId
    },
    {
      title: 'Divorcio contencioso - María Carmen López',
      description: 'Procedimiento de divorcio con custodia compartida y liquidación de bienes gananciales.',
      client_id: clients[1].id,
      practice_area: 'Derecho Civil',
      status: 'open',
      matter_number: 'CV-2024-002',
      estimated_budget: 8000,
      billing_method: 'fixed',
      org_id: orgId
    },
    {
      title: 'Constitución sociedad - Gourmet Group',
      description: 'Constitución de nueva filial y reestructuración societaria del grupo empresarial.',
      client_id: clients[2].id,
      practice_area: 'Derecho Mercantil',
      status: 'open',
      matter_number: 'MC-2024-001',
      estimated_budget: 12000,
      billing_method: 'hourly',
      org_id: orgId
    },
    {
      title: 'Despido improcedente - José Antonio Fernández',
      description: 'Demanda por despido improcedente. Reclamación de indemnización y salarios de tramitación.',
      client_id: clients[3].id,
      practice_area: 'Derecho Laboral',
      status: 'open',
      matter_number: 'LB-2024-001',
      estimated_budget: 5000,
      billing_method: 'success_fee',
      org_id: orgId
    },
    {
      title: 'Asesoría fiscal integral - TechStart',
      description: 'Planificación fiscal, revisión de contratos y cumplimiento normativo para startup tecnológica.',
      client_id: clients[4].id,
      practice_area: 'Derecho Tributario',
      status: 'open',
      matter_number: 'TR-2024-001',
      estimated_budget: 18000,
      billing_method: 'retainer',
      org_id: orgId
    }
  ]

  const { data: createdCases } = await supabase
    .from('cases')
    .insert(cases)
    .select()

  return createdCases || []
}
