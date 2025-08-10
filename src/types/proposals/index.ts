/**
 * Tipos centralizados para el módulo de propuestas
 * Esta será la fuente única de verdad para todos los tipos de propuesta
 */

// Main proposal types (from core proposals module)
export * from '../proposals'

// Form schemas and types (includes SelectedService)
export * from './forms'

// Re-export specific types from legal types but avoid conflicts
export type { LegalProposalData, ProposalStep, PROPOSAL_STEPS } from '../../components/proposals/legal/types/legalProposal.types'