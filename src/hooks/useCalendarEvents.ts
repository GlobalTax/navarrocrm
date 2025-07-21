
import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert } from '@/integrations/supabase/types'
import { toast } from 'sonner'

export type CalendarEvent = Tables<'calendar_events'> & {
  contact?: Tables<'contacts'>
  case?: Tables<'cases'>
}

export type CreateCalendarEventData = Omit<TablesInsert<'calendar_events'>, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'org_id'>

export const useCalendarEvents = () => {
  const queryClient = useQueryClient()

  const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        contact:contacts(*),
        case:cases(*)
      `)
      .order('start_datetime', { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  }

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 2, // 2 minutos para eventos (datos que cambian frecuentemente)
    select: (data) => data.map(event => ({
      ...event,
      contact: event.contact || undefined,
      case: event.case || undefined
    })),
    placeholderData: (previousData) => previousData ?? [],
  })

  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateCalendarEventData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .maybeSingle()

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
        .maybeSingle()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento creado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al crear el evento')
    },
  })

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento actualizado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar el evento')
    },
  })

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
