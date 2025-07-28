import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { getUserOrgId } from '@/lib/quantum/orgId'

// Interface mínima para detección de duplicados
export interface ExistingContact {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  org_id: string
  quantum_customer_id?: string | null
}

export const useExistingContacts = () => {
  return useQuery({
    queryKey: ['existing-contacts'],
    queryFn: async () => {
      const orgId = await getUserOrgId()

      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, phone, dni_nif, org_id, quantum_customer_id')
        .eq('org_id', orgId)

      if (error) throw error

      return (data || []) as ExistingContact[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Re-export from new quantum utils
export { type DuplicateInfo, detectDuplicate } from '@/lib/quantum/duplicates'