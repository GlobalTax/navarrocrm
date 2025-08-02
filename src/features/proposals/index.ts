// Proposals Feature - Export all proposal-related functionality
export { useSaveProposal } from './hooks/useSaveProposal'
export { ProposalBuilder } from './components/ProposalBuilder'

// Re-export types
export type { ProposalFormData } from './types/proposal.schema'

// Re-export services for backward compatibility
export { saveProposal } from './services/proposal.service'