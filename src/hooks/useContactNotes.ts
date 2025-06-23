
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface ContactNote {
  id: string
  contact_id: string
  org_id: string
  user_id: string
  title: string
  content: string | null
  note_type: 'general' | 'llamada' | 'reunion' | 'email' | 'tarea' | 'recordatorio'
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface CreateContactNoteData {
  contact_id: string
  title: string
  content?: string
  note_type: ContactNote['note_type']
  is_private?: boolean
}

export const useContactNotes = (contactId?: string) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['contact-notes', contactId],
    queryFn: async () => {
      if (!contactId || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contact notes:', error)
        throw error
      }
      return data as ContactNote[]
    },
    enabled: !!contactId && !!user?.org_id,
  })

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: CreateContactNoteData) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('contact_notes')
        .insert({
          ...noteData,
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
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] })
      toast.success('La nota se ha creado correctamente')
    },
    onError: (error) => {
      console.error('Error creating contact note:', error)
      toast.error('No se pudo crear la nota')
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ContactNote> & { id: string }) => {
      const { data, error } = await supabase
        .from('contact_notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] })
      toast.success('La nota se ha actualizado correctamente')
    },
    onError: (error) => {
      console.error('Error updating contact note:', error)
      toast.error('No se pudo actualizar la nota')
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('contact_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] })
      toast.success('La nota se ha eliminado correctamente')
    },
    onError: (error) => {
      console.error('Error deleting contact note:', error)
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
