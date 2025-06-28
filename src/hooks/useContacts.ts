
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  status: string
  org_id: string
  created_at: string
  updated_at: string
}

export const useContacts = () => {
  const { user } = useApp()

  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts', user?.org_id],
    queryFn: async (): Promise<Contact[]> => {
      console.log('🔄 Fetching contacts for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return []
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('org_id', user.org_id)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching contacts:', error)
        throw error
      }
      
      console.log('✅ Contacts fetched:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.org_id,
  })

  return {
    contacts,
    isLoading,
    error,
  }
}
