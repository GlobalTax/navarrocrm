/**
 * Proposals Feature Module
 * 
 * Gestión de propuestas comerciales y presupuestos
 */

// Components (pages)
export { default as ProposalsPage } from './pages/ProposalsPage'

// Components
export { ProposalsList } from './components/ProposalsList'
export { ProposalsFiltersSection } from './components/ProposalsFilters'
export { AllProposalsTable } from './components/AllProposalsTable'
export { ProposalConfirmationDialog } from './components/ProposalConfirmationDialog'
export { ProposalsBuilderManager } from './components/ProposalsBuilderManager'
export { ProposalEmptyState } from './components/ProposalEmptyState'

// Hooks
export { useProposalsList, useProposalsQueries, useProposalsActions } from './hooks'
export { useSaveProposal } from './hooks/useSaveProposal'

// Utils
export * from './utils/proposalFormatters'
export * from './utils/dataTransformer'

// Services
export * from './services/proposal.service'

// Types - export from centralized location
export type { Proposal, CreateProposalData, ProposalLineItem } from '@/types/proposals'