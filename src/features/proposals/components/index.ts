/**
 * Proposals Components Module
 */

import React from 'react'

// Re-export de componentes existentes
export { AllProposalsTable } from '@/components/proposals/AllProposalsTable'
export { NewProposalDialog } from '@/components/proposals/NewProposalDialog'
export { ClientSelectorWithProspect } from '@/components/proposals/ClientSelectorWithProspect'

// Re-export de componentes de fases
export { AdvancedPhaseManager as PhaseManager } from '@/components/phases/AdvancedPhaseManager'

// Placeholder para componentes que crearemos
export const ProposalWizard = () => {
  return React.createElement('div', null, 'ProposalWizard - To be implemented')
}

export const ProposalEditor = () => {
  return React.createElement('div', null, 'ProposalEditor - To be implemented')
}

export const ProposalPreview = () => {
  return React.createElement('div', null, 'ProposalPreview - To be implemented')
}

export const ProposalLineItemsForm = () => {
  return React.createElement('div', null, 'ProposalLineItemsForm - To be implemented')
}