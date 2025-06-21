
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert } from '@/integrations/supabase/types'
import { toast } from 'sonner'

export type CalendarEvent = Tables<'calendar_events'> & {
  client?: Tables<'clients'>
  case?: Tables<'cases'>
}

export type CreateCalendarEventData = Omit<TablesInsert<'calendar_events'>, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'org_id'>

export const useCalendarEvents = () => {
  const queryClient = useQueryClient()

  // Obtener eventos del mes actual
  const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        client:clients(*),
        case:cases(*)
      `)
      .order('start_datetime', { ascending: true })

    if (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }

    return data || []
  }

  // Query para obtener eventos
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: getCalendarEvents,
  })

  // Mutation para crear evento
  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateCalendarEventData) => {
      // Obtener el usuario actual y su organización
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!userData?.org_id) throw new Error('Usuario sin organización')

      const completeEventData = {
        ...eventData,
        created_by: user.id,
        org_id: userData.org_id
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([completeEventData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento creado exitosamente')
    },
    onError: (error) => {
      console.error('Error creating event:', error)
      toast.error('Error al crear el evento')
    },
  })

  // Mutation para actualizar evento
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento actualizado exitosamente')
    },
    onError: (error) => {
      console.error('Error updating event:', error)
      toast.error('Error al actualizar el evento')
    },
  })

  // Mutation para eliminar evento
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento eliminado exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting event:', error)
      toast.error('Error al eliminar el evento')
    },
  })

  return {
    events,
    isLoading,
    error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  }
}
