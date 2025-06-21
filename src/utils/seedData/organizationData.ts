
import { supabase } from '@/integrations/supabase/client'

export const createOrganization = async () => {
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      name: 'Bufete García & Asociados'
    })
    .select()
    .single()

  if (!org) throw new Error('No se pudo crear la organización')
  return org
}
