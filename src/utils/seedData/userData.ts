
import { supabase } from '@/integrations/supabase/client'
import type { SeedUser } from './types'

export const createUsers = async (orgId: string) => {
  const users: SeedUser[] = [
    { id: crypto.randomUUID(), email: 'partner@garcia-asociados.com', role: 'partner', org_id: orgId },
    { id: crypto.randomUUID(), email: 'senior@garcia-asociados.com', role: 'senior', org_id: orgId },
    { id: crypto.randomUUID(), email: 'junior@garcia-asociados.com', role: 'junior', org_id: orgId },
    { id: crypto.randomUUID(), email: 'admin@garcia-asociados.com', role: 'admin', org_id: orgId }
  ]

  const { data: createdUsers } = await supabase
    .from('users')
    .insert(users)
    .select()

  return createdUsers || []
}
