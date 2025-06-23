
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface ProposalPhase {
  id: string
  name: string
  description: string
  services: ProposalService[]
  estimatedHours?: number
  deliverables: string[]
  paymentPercentage: number
  estimatedDuration?: string
}

export interface ProposalService {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ProposalTeamMember {
  id: string
  name: string
  role: string
  experience?: string
}

export interface ProposalData {
  // Basic info
  title: string
  clientId: string
  projectReference: string
  
  // Company info
  companyName: string
  companyDescription: string
  
  // Content
  introduction: string
  phases: ProposalPhase[]
  team: ProposalTeamMember[]
  
  // Terms
  validityDays: number
  paymentTerms: string
  confidentialityClause: boolean
  expensesIncluded: boolean
  
  // Totals
  subtotal: number
  expenses: number
  iva: number
  total: number
}

export const useProposalProfessional = () => {
  const { user } = useApp()
  const [isSaving, setIsSaving] = useState(false)

  const saveProposal = async (proposalData: ProposalData) => {
    if (!user?.org_id) {
      toast.error("Usuario no autenticado")
      return
    }

    setIsSaving(true)
    try {
      // Convert data to JSON-compatible format
      const pricingTiersData = {
        phases: proposalData.phases.map(phase => ({
          id: phase.id,
          name: phase.name,
          description: phase.description,
          services: phase.services.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description,
            quantity: service.quantity,
            unitPrice: service.unitPrice,
            total: service.total
          })),
          estimatedHours: phase.estimatedHours || 0,
          deliverables: phase.deliverables,
          paymentPercentage: phase.paymentPercentage,
          estimatedDuration: phase.estimatedDuration || ''
        })),
        team: proposalData.team.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
          experience: member.experience || ''
        })),
        companyInfo: {
          name: proposalData.companyName,
          description: proposalData.companyDescription
        },
        terms: {
          paymentTerms: proposalData.paymentTerms,
          confidentialityClause: proposalData.confidentialityClause,
          expensesIncluded: proposalData.expensesIncluded
        }
      }

      // Create the proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          org_id: user.org_id,
          client_id: proposalData.clientId,
          title: proposalData.title,
          description: proposalData.introduction,
          total_amount: proposalData.total,
          currency: 'EUR',
          proposal_type: 'service',
          status: 'draft',
          created_by: user.id,
          valid_until: new Date(Date.now() + proposalData.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          introduction: proposalData.introduction,
          proposal_number: proposalData.projectReference,
          pricing_tiers_data: pricingTiersData
        })
        .select()
        .single()

      if (proposalError) throw proposalError

      // Create line items for all services in all phases
      const lineItems = proposalData.phases.flatMap((phase, phaseIndex) =>
        phase.services.map((service, serviceIndex) => ({
          proposal_id: proposal.id,
          name: `${phase.name} - ${service.name}`,
          description: service.description,
          quantity: service.quantity,
          unit_price: service.unitPrice,
          total_price: service.total,
          billing_unit: 'servicio',
          sort_order: phaseIndex * 100 + serviceIndex
        }))
      )

      if (lineItems.length > 0) {
        const { error: lineItemsError } = await supabase
          .from('proposal_line_items')
          .insert(lineItems)

        if (lineItemsError) throw lineItemsError
      }

      toast.success(`La propuesta profesional "${proposalData.title}" ha sido guardada exitosamente.`)

      return proposal
    } catch (error: any) {
      console.error('Error saving professional proposal:', error)
      toast.error(error.message || "Ha ocurrido un error inesperado")
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  return {
    saveProposal,
    isSaving
  }
}
