
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface ClientDocument {
  id: string
  file_name: string
  file_type: string
  file_size: number
  document_type: string
  description?: string
  created_at: string
  user_id: string
  file_path: string
}

export const useClientDocuments = (clientId: string) => {
  const { user } = useApp()

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['client-documents', clientId, user?.org_id],
    queryFn: async () => {
      if (!clientId || !user?.org_id) return []

      const { data, error } = await supabase
        .from('contact_documents')
        .select('*')
        .eq('contact_id', clientId)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching client documents:', error)
        return []
      }

      return data as ClientDocument[]
    },
    enabled: !!clientId && !!user?.org_id
  })

  // Métricas calculadas
  const totalDocuments = documents.length
  const contractsCount = documents.filter(d => d.document_type === 'contract').length
  const proposalsCount = documents.filter(d => d.document_type === 'proposal').length
  const legalCount = documents.filter(d => d.document_type === 'legal').length
  const generalCount = documents.filter(d => d.document_type === 'general').length

  const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0)

  return {
    documents,
    isLoading,
    metrics: {
      totalDocuments,
      contractsCount,
      proposalsCount,
      legalCount,
      generalCount,
      totalSize
    }
  }
}
