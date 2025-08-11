import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface ContactBasic { id: string; name: string }

export const useContactsBasic = () => {
  return useQuery<ContactBasic[]>({
    queryKey: ['contacts-basic'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id,name')
        .order('name', { ascending: true })
      if (error) throw error
      return (data as ContactBasic[]) || []
    }
  })
}
