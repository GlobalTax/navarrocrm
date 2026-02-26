import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface ClassificationReview {
  id: string
  org_id: string
  contact_id: string
  current_client_type: string
  suggested_client_type: string
  confidence: number
  reason: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected' | 'auto_applied'
  source: string
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

export interface MisclassifiedContact {
  contact_id: string
  contact_name: string
  current_type: string
  suggested_type: string
  confidence: number
  matched_pattern: string
  source: string
}

export const useClassificationReviews = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  // Fetch existing reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['classification-reviews', user?.org_id, statusFilter],
    queryFn: async () => {
      if (!user?.org_id) return []
      const query = supabase
        .from('contact_classification_reviews')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
      
      if (statusFilter !== 'all') {
        query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as ClassificationReview[]
    },
    enabled: !!user?.org_id,
  })

  // Detect misclassified contacts via RPC
  const detectMutation = useMutation({
    mutationFn: async () => {
      if (!user?.org_id) throw new Error('No org_id')
      const { data, error } = await supabase.rpc('detect_misclassified_contacts', {
        org_uuid: user.org_id,
        max_results: 200,
      })
      if (error) throw error
      return (data || []) as MisclassifiedContact[]
    },
  })

  // Create reviews from detected contacts
  const createReviewsMutation = useMutation({
    mutationFn: async (contacts: MisclassifiedContact[]) => {
      if (!user?.org_id) throw new Error('No org_id')
      
      const reviews = contacts.map(c => ({
        org_id: user.org_id!,
        contact_id: c.contact_id,
        current_client_type: c.current_type,
        suggested_client_type: c.suggested_type,
        confidence: c.confidence,
        reason: { pattern: c.matched_pattern, source: c.source } as unknown as Record<string, never>,
        source: 'rule_engine' as const,
        status: c.confidence >= 0.90 ? 'auto_applied' : 'pending',
      }))

      const { error } = await supabase
        .from('contact_classification_reviews')
        .insert(reviews)
      if (error) throw error

      // Auto-apply high confidence ones
      const autoApply = contacts.filter(c => c.confidence >= 0.90)
      if (autoApply.length > 0) {
        for (const c of autoApply) {
          await supabase
            .from('contacts')
            .update({ client_type: 'empresa' })
            .eq('id', c.contact_id)
        }
      }

      return { total: contacts.length, autoApplied: autoApply.length }
    },
    onSuccess: (result) => {
      toast.success(`${result.total} contactos analizados. ${result.autoApplied} reclasificados automáticamente.`)
      queryClient.invalidateQueries({ queryKey: ['classification-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      queryClient.invalidateQueries({ queryKey: ['infinite-persons'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: (error) => {
      console.error('Error creating reviews:', error)
      toast.error('Error al crear revisiones de clasificación')
    },
  })

  // Approve a review (apply the reclassification)
  const approveMutation = useMutation({
    mutationFn: async (reviewIds: string[]) => {
      if (!user?.id) throw new Error('No user')
      
      // Get reviews to apply
      const { data: reviewsToApply, error: fetchError } = await supabase
        .from('contact_classification_reviews')
        .select('*')
        .in('id', reviewIds)
      if (fetchError) throw fetchError

      // Update contacts
      for (const review of (reviewsToApply || [])) {
        await supabase
          .from('contacts')
          .update({ client_type: review.suggested_client_type })
          .eq('id', review.contact_id)
      }

      // Mark reviews as approved
      const { error } = await supabase
        .from('contact_classification_reviews')
        .update({ 
          status: 'approved', 
          reviewed_at: new Date().toISOString(), 
          reviewed_by: user.id 
        })
        .in('id', reviewIds)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Reclasificaciones aprobadas')
      queryClient.invalidateQueries({ queryKey: ['classification-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      queryClient.invalidateQueries({ queryKey: ['infinite-persons'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: () => toast.error('Error al aprobar reclasificaciones'),
  })

  // Reject reviews
  const rejectMutation = useMutation({
    mutationFn: async (reviewIds: string[]) => {
      if (!user?.id) throw new Error('No user')
      const { error } = await supabase
        .from('contact_classification_reviews')
        .update({ 
          status: 'rejected', 
          reviewed_at: new Date().toISOString(), 
          reviewed_by: user.id 
        })
        .in('id', reviewIds)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Sugerencias rechazadas')
      queryClient.invalidateQueries({ queryKey: ['classification-reviews'] })
    },
    onError: () => toast.error('Error al rechazar sugerencias'),
  })

  return {
    reviews,
    isLoadingReviews,
    statusFilter,
    setStatusFilter,
    detectMisclassified: detectMutation.mutateAsync,
    isDetecting: detectMutation.isPending,
    detectedContacts: detectMutation.data,
    createReviews: createReviewsMutation.mutateAsync,
    isCreatingReviews: createReviewsMutation.isPending,
    approveReviews: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectReviews: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  }
}
