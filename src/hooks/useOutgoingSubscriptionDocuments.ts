import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { OutgoingSubscriptionDocument, CreateOutgoingSubscriptionDocumentData } from '@/types/outgoing-subscription-documents'

export const useOutgoingSubscriptionDocuments = (subscriptionId?: string) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: documents, isLoading } = useQuery({
    queryKey: ['outgoing-subscription-documents', subscriptionId],
    queryFn: async (): Promise<OutgoingSubscriptionDocument[]> => {
      if (!user?.org_id) return []
      
      let query = supabase
        .from('outgoing_subscription_documents')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (subscriptionId) {
        query = query.eq('subscription_id', subscriptionId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as OutgoingSubscriptionDocument[]
    },
    enabled: !!user?.org_id,
  })

  const createDocument = useMutation({
    mutationFn: async (data: CreateOutgoingSubscriptionDocumentData): Promise<OutgoingSubscriptionDocument> => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data: result, error } = await supabase
        .from('outgoing_subscription_documents')
        .insert({
          ...data,
          org_id: user.org_id,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      return result as OutgoingSubscriptionDocument
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscription-documents'] })
      toast.success('Documento subido exitosamente')
    },
    onError: (error) => {
      console.error('Error uploading document:', error)
      toast.error('Error al subir el documento')
    },
  })

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // Primero obtener el documento para saber la ruta del archivo
      const { data: document, error: fetchError } = await supabase
        .from('outgoing_subscription_documents')
        .select('file_path')
        .eq('id', documentId)
        .single()

      if (fetchError) throw fetchError

      // Eliminar el archivo del storage
      const { error: storageError } = await supabase.storage
        .from('outgoing-subscription-documents')
        .remove([document.file_path])

      if (storageError) throw storageError

      // Eliminar el registro de la base de datos
      const { error } = await supabase
        .from('outgoing_subscription_documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscription-documents'] })
      toast.success('Documento eliminado exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting document:', error)
      toast.error('Error al eliminar el documento')
    },
  })

  const uploadFile = useMutation({
    mutationFn: async ({ file, filePath }: { file: File; filePath: string }) => {
      const { data, error } = await supabase.storage
        .from('outgoing-subscription-documents')
        .upload(filePath, file)

      if (error) throw error
      return data
    },
    onError: (error) => {
      console.error('Error uploading file to storage:', error)
      toast.error('Error al subir el archivo')
    },
  })

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('outgoing-subscription-documents')
        .download(filePath)

      if (error) throw error

      // Crear un enlace de descarga
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Error al descargar el archivo')
    }
  }

  return {
    documents: documents || [],
    isLoading,
    createDocument,
    deleteDocument,
    uploadFile,
    downloadFile,
    isCreating: createDocument.isPending,
    isDeleting: deleteDocument.isPending,
    isUploading: uploadFile.isPending
  }
}