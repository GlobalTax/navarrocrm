import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { JobOffer, JobOfferTemplate, CreateJobOfferData, JobOfferStatus } from '@/types/job-offers'
import { toast } from 'sonner'
import { useApp } from '@/contexts/AppContext'

export const useJobOffers = () => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [templates, setTemplates] = useState<JobOfferTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const { user } = useApp()

  const fetchJobOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('job_offers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobOffers((data || []) as JobOffer[])
    } catch (error: any) {
      console.error('Error fetching job offers:', error)
      toast.error('No se pudieron cargar las ofertas de trabajo')
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('job_offer_templates')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setTemplates((data || []) as JobOfferTemplate[])
    } catch (error: any) {
      console.error('Error fetching templates:', error)
    }
  }

  const createJobOffer = async (data: CreateJobOfferData): Promise<JobOffer | null> => {
    if (!user?.org_id) {
      toast.error('No se pudo identificar la organización')
      return null
    }

    setIsCreating(true)
    try {
      const { data: newJobOffer, error } = await supabase
        .from('job_offers')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id,
          benefits: data.benefits || [],
          requirements: data.requirements || [],
          responsibilities: data.responsibilities || []
        })
        .select()
        .single()

      if (error) throw error

      // Registrar actividad
      await supabase
        .from('job_offer_activities')
        .insert({
          job_offer_id: newJobOffer.id,
          org_id: user.org_id,
          user_id: user.id,
          activity_type: 'created',
          details: { title: data.title, candidate: data.candidate_name }
        })

      setJobOffers(prev => [newJobOffer as JobOffer, ...prev])
      
      toast.success('Oferta de trabajo creada correctamente')

      return newJobOffer as JobOffer
    } catch (error: any) {
      console.error('Error creating job offer:', error)
      toast.error('No se pudo crear la oferta de trabajo')
      return null
    } finally {
      setIsCreating(false)
    }
  }

  const updateJobOfferStatus = async (id: string, status: JobOfferStatus): Promise<boolean> => {
    if (!user?.org_id) return false

    try {
      const updates: any = { status }
      
      if (status === 'sent') {
        updates.sent_at = new Date().toISOString()
      } else if (status === 'accepted' || status === 'declined') {
        updates.responded_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('job_offers')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Registrar actividad
      await supabase
        .from('job_offer_activities')
        .insert({
          job_offer_id: id,
          org_id: user.org_id,
          user_id: user.id,
          activity_type: status === 'sent' ? 'sent' : status,
          details: { new_status: status }
        })

      setJobOffers(prev => 
        prev.map(offer => 
          offer.id === id ? { ...offer, ...updates } : offer
        )
      )

      toast.success(`Estado actualizado a ${status}`)

      return true
    } catch (error: any) {
      console.error('Error updating job offer status:', error)
      toast.error('No se pudo actualizar el estado')
      return false
    }
  }

  const deleteJobOffer = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_offers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setJobOffers(prev => prev.filter(offer => offer.id !== id))
      
      toast.success('Oferta eliminada correctamente')

      return true
    } catch (error: any) {
      console.error('Error deleting job offer:', error)
      toast.error('No se pudo eliminar la oferta')
      return false
    }
  }

  const sendJobOffer = async (id: string): Promise<boolean> => {
    try {
      // Llamar a la edge function para enviar el email
      const { error } = await supabase.functions.invoke('send-job-offer', {
        body: { job_offer_id: id }
      })

      if (error) throw error

      await updateJobOfferStatus(id, 'sent')
      return true
    } catch (error: any) {
      console.error('Error sending job offer:', error)
      toast.error('No se pudo enviar la oferta por email')
      return false
    }
  }

  const createSignatureRequest = async (id: string): Promise<string | null> => {
    try {
      const jobOffer = jobOffers.find(offer => offer.id === id);
      if (!jobOffer) throw new Error('Job offer not found');

      const { data, error } = await supabase.functions.invoke('create-signature-request', {
        body: {
          jobOfferId: id,
          candidateName: jobOffer.candidate_name,
          candidateEmail: jobOffer.candidate_email,
          orgId: jobOffer.org_id
        }
      });

      if (error) throw error;

      toast.success('Enlace de firma creado exitosamente');
      return data.signingUrl;
    } catch (error: any) {
      console.error('Error creating signature request:', error);
      toast.error('Error al crear el enlace de firma');
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchJobOffers(), fetchTemplates()])
      setIsLoading(false)
    }

    loadData()
  }, [])

  return {
    jobOffers,
    templates,
    isLoading,
    isCreating,
    createJobOffer,
    updateJobOfferStatus,
    deleteJobOffer,
    sendJobOffer,
    createSignatureRequest,
    refetch: () => Promise.all([fetchJobOffers(), fetchTemplates()])
  }
}