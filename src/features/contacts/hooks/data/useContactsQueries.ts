/**
 * Contacts data queries - standardized with new query system
 */

import { useAuth } from '@/contexts/auth'
import { createQuery } from '@/lib/queries/base'
import { contactsDAL, type Contact } from '@/lib/dal'

export const useContactsQueries = () => {
  const { user } = useAuth()
  
  const orgId = user?.org_id
  
  return createQuery<Contact[]>(
    ['contacts', orgId],
    async () => {
      if (!orgId) {
        throw new Error('Organization ID required')
      }
      
      const response = await contactsDAL.findMany({
        filters: { org_id: orgId }
      })
      
      if (!response.success) {
        throw response.error || new Error('Failed to fetch contacts')
      }
      
      return response.data
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}