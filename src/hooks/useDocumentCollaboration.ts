import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  content: string
  variables_data: Record<string, any>
  changes_summary: string | null
  created_by: string
  created_at: string
  org_id: string
}

export interface DocumentComment {
  id: string
  document_id: string
  version_id: string | null
  user_id: string
  comment_text: string
  position_data: any
  status: string
  is_internal: boolean
  parent_comment_id: string | null
  mentioned_users: string[]
  created_at: string
  updated_at: string
  org_id: string
}

export interface DocumentShare {
  id: string
  document_id: string
  shared_by: string
  shared_with: string | null
  shared_with_role: string | null
  permissions: Record<string, boolean>
  expires_at: string | null
  is_active: boolean
  share_token: string | null
  created_at: string
  org_id: string
}

export interface DocumentActivity {
  id: string
  document_id: string
  user_id: string
  action_type: string
  details: Record<string, any>
  old_value: any
  new_value: any
  created_at: string
  org_id: string
}

export const useDocumentCollaboration = (documentId?: string) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Query para versiones del documento
  const versionsQuery = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async (): Promise<DocumentVersion[]> => {
      if (!documentId || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .eq('org_id', user.org_id)
        .order('version_number', { ascending: false })

      if (error) throw error
      return (data || []).map(item => ({
        ...item,
        variables_data: typeof item.variables_data === 'object' ? item.variables_data as Record<string, any> : {}
      }))
    },
    enabled: !!documentId && !!user?.org_id,
  })

  // Query para comentarios del documento
  const commentsQuery = useQuery({
    queryKey: ['document-comments', documentId],
    queryFn: async (): Promise<DocumentComment[]> => {
      if (!documentId || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!documentId && !!user?.org_id,
  })

  // Query para actividades del documento
  const activitiesQuery = useQuery({
    queryKey: ['document-activities', documentId],
    queryFn: async (): Promise<DocumentActivity[]> => {
      if (!documentId || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('document_activities')
        .select('*')
        .eq('document_id', documentId)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return (data || []).map(item => ({
        ...item,
        details: typeof item.details === 'object' ? item.details as Record<string, any> : {},
        old_value: item.old_value,
        new_value: item.new_value
      }))
    },
    enabled: !!documentId && !!user?.org_id,
  })

  // Query para shares del documento
  const sharesQuery = useQuery({
    queryKey: ['document-shares', documentId],
    queryFn: async (): Promise<DocumentShare[]> => {
      if (!documentId || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('document_shares')
        .select('*')
        .eq('document_id', documentId)
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(item => ({
        ...item,
        permissions: typeof item.permissions === 'object' ? item.permissions as Record<string, boolean> : { read: true, comment: false, edit: false }
      }))
    },
    enabled: !!documentId && !!user?.org_id,
  })

  // Mutación para crear comentario
  const createComment = useMutation({
    mutationFn: async (comment: {
      document_id: string
      comment_text: string
      position_data?: any
      is_internal?: boolean
      parent_comment_id?: string
      mentioned_users?: string[]
    }) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data, error } = await supabase
        .from('document_comments')
        .insert({
          ...comment,
          user_id: user.id,
          org_id: user.org_id,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-comments', documentId] })
      queryClient.invalidateQueries({ queryKey: ['document-activities', documentId] })
      toast.success('Comentario agregado')
    },
    onError: (error: any) => {
      toast.error('Error agregando comentario: ' + error.message)
    },
  })

  // Mutación para resolver comentario
  const resolveComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { data, error } = await supabase
        .from('document_comments')
        .update({ status: 'resolved' })
        .eq('id', commentId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-comments', documentId] })
      toast.success('Comentario resuelto')
    },
    onError: (error: any) => {
      toast.error('Error resolviendo comentario: ' + error.message)
    },
  })

  // Mutación para compartir documento
  const shareDocument = useMutation({
    mutationFn: async (share: {
      document_id: string
      shared_with?: string
      shared_with_role?: string
      permissions: Record<string, boolean>
      expires_at?: string
    }) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data, error } = await supabase
        .from('document_shares')
        .insert({
          ...share,
          shared_by: user.id,
          org_id: user.org_id,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-shares', documentId] })
      queryClient.invalidateQueries({ queryKey: ['document-activities', documentId] })
      toast.success('Documento compartido')
    },
    onError: (error: any) => {
      toast.error('Error compartiendo documento: ' + error.message)
    },
  })

  // Mutación para revocar acceso
  const revokeAccess = useMutation({
    mutationFn: async (shareId: string) => {
      const { data, error } = await supabase
        .from('document_shares')
        .update({ is_active: false })
        .eq('id', shareId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-shares', documentId] })
      toast.success('Acceso revocado')
    },
    onError: (error: any) => {
      toast.error('Error revocando acceso: ' + error.message)
    },
  })

  // Mutación para restaurar versión
  const restoreVersion = useMutation({
    mutationFn: async (versionId: string) => {
      if (!documentId || !user?.org_id) throw new Error('Document ID or organization not found')

      // Obtener la versión a restaurar
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .select('*')
        .eq('id', versionId)
        .single()

      if (versionError) throw versionError

      // Actualizar el documento principal con el contenido de la versión
      const { data, error } = await supabase
        .from('generated_documents')
        .update({
          content: version.content,
          variables_data: version.variables_data,
          status: 'draft' // Marcar como borrador al restaurar
        })
        .eq('id', documentId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] })
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] })
      queryClient.invalidateQueries({ queryKey: ['document-activities', documentId] })
      toast.success('Versión restaurada exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error restaurando versión: ' + error.message)
    },
  })

  // Función para comparar versiones
  const compareVersions = (version1: DocumentVersion, version2: DocumentVersion) => {
    // Esta función podría implementar una comparación de texto más sofisticada
    // Por ahora devolvemos los contenidos para comparación visual
    return {
      version1: {
        number: version1.version_number,
        content: version1.content,
        variables: version1.variables_data,
        date: version1.created_at
      },
      version2: {
        number: version2.version_number,
        content: version2.content,
        variables: version2.variables_data,
        date: version2.created_at
      }
    }
  }

  return {
    versions: versionsQuery.data || [],
    comments: commentsQuery.data || [],
    activities: activitiesQuery.data || [],
    shares: sharesQuery.data || [],
    isLoading: versionsQuery.isLoading || commentsQuery.isLoading || activitiesQuery.isLoading || sharesQuery.isLoading,
    error: versionsQuery.error || commentsQuery.error || activitiesQuery.error || sharesQuery.error,
    createComment,
    resolveComment,
    shareDocument,
    revokeAccess,
    restoreVersion,
    compareVersions
  }
}