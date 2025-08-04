/**
 * Proposals Feature Module
 * Punto de entrada centralizado para toda la funcionalidad de propuestas
 */

// Re-exports de componentes principales
export { AllProposalsTable } from './components'
export { NewProposalDialog } from './components'
export { ProposalWizard } from './components'
export { ProposalEditor } from './components'
export { ProposalPreview } from './components'
export { ProposalLineItemsForm } from './components'
export { PhaseManager } from './components'
export { ClientSelectorWithProspect } from './components'

// Re-exports de hooks
export { useProposals } from './hooks'
export { useCreateProposal } from './hooks'
export { useProposalsData } from './hooks'
export { useUpdateProposalStatus } from './hooks'
export { useProspectToClient } from './hooks'

// Re-exports de tipos
export type {
  Proposal,
  CreateProposalData,
  ProposalLineItem,
  ProposalStatus,
  ProposalType
} from './types'