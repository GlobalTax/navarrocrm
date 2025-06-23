
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface ClientNote {
  id: string
  client_id: string
  org_id: string
  user_id: string
  title: string
  content: string | null
  note_type: 'general' | 'llamada' | 'reunion' | 'email' | 'tarea' | 'recordatorio'
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface CreateClientNoteData {
  client_id: string
  title: string
  content?: string
  note_type: ClientNote['note_type']
  is_private?: boolean
}

export const useClientNotes = (clientId?: string) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['client-notes', clientId],
    queryFn: async () => {
      if (!clientId || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('contact_notes') // Changed from 'client_notes' to 'contact_notes'
        .select('*')
        .eq('contact_id', clientId) // Changed from 'client_id' to 'contact_id'
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching client notes:', error)
        throw error
      }
      return data as ClientNote[]
    },
    enabled: !!clientId && !!user?.org_id,
  })

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: CreateClientNoteData) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('contact_notes') // Changed from 'client_notes' to 'contact_notes'
        .insert({
          ...noteData,
          contact_id: noteData.client_id, // Map client_id to contact_id
          org_id: user.org_id,
          user_id: user.id,
          is_private: noteData.is_private || false
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] })
      toast.success('La nota se ha creado correctamente')
    },
    onError: (error) => {
      console.error('Error creating client note:', error)
      toast.error('No se pudo crear la nota')
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ClientNote> & { id: string }) => {
      const { data, error } = await supabase
        .from('contact_notes') // Changed from 'client_notes' to 'contact_notes'
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] })
      toast.success('La nota se ha actualizado correctamente')
    },
    onError: (error) => {
      console.error('Error updating client note:', error)
      toast.error('No se pudo actualizar la nota')
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('contact_notes') // Changed from 'client_notes' to 'contact_notes'
        .delete()
        .eq('id', noteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] })
      toast.success('La nota se ha eliminado correctamente')
    },
    onError: (error) => {
      console.error('Error deleting client note:', error)
      toast.error('No se pudo eliminar la nota')
    },
  })

  return {
    notes,
    isLoading,
    error,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  }
}
