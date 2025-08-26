/**
 * Proposals page UI state management
 */

import { useState, useCallback } from 'react'
import { useLogger } from '@/utils/logging'

interface ProposalsPageState {
  // Dialog states
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  
  // Selected items
  selectedProposalId: string | null
  
  // View states
  viewMode: 'grid' | 'list' | 'kanban'
  
  // Bulk actions
  selectedProposalIds: string[]
  isBulkActionMode: boolean
  
  // Legacy properties for backward compatibility
  isRecurrentBuilderOpen?: boolean
  isSpecificBuilderOpen?: boolean
  isEditMode?: boolean
  editingProposal?: any
}

export const useProposalsPageState = () => {
  const logger = useLogger('ProposalsPageState')
  
  const [state, setState] = useState<ProposalsPageState>({
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    isDeleteDialogOpen: false,
    selectedProposalId: null,
    viewMode: 'grid',
    selectedProposalIds: [],
    isBulkActionMode: false,
    
    // Legacy properties for backward compatibility
    isRecurrentBuilderOpen: false,
    isSpecificBuilderOpen: false,
    isEditMode: false,
    editingProposal: null,
  })

  // Dialog actions
  const openCreateDialog = useCallback(() => {
    logger.debug('Opening create proposal dialog')
    setState(prev => ({ ...prev, isCreateDialogOpen: true }))
  }, [logger])

  const closeCreateDialog = useCallback(() => {
    logger.debug('Closing create proposal dialog')
    setState(prev => ({ ...prev, isCreateDialogOpen: false }))
  }, [logger])

  const openEditDialog = useCallback((proposalId: string) => {
    logger.debug('Opening edit dialog for proposal', { proposalId })
    setState(prev => ({ 
      ...prev, 
      isEditDialogOpen: true, 
      selectedProposalId: proposalId 
    }))
  }, [logger])

  const closeEditDialog = useCallback(() => {
    logger.debug('Closing edit proposal dialog')
    setState(prev => ({ 
      ...prev, 
      isEditDialogOpen: false, 
      selectedProposalId: null 
    }))
  }, [logger])

  const openDeleteDialog = useCallback((proposalId: string) => {
    logger.debug('Opening delete dialog for proposal', { proposalId })
    setState(prev => ({ 
      ...prev, 
      isDeleteDialogOpen: true, 
      selectedProposalId: proposalId 
    }))
  }, [logger])

  const closeDeleteDialog = useCallback(() => {
    logger.debug('Closing delete proposal dialog')
    setState(prev => ({ 
      ...prev, 
      isDeleteDialogOpen: false, 
      selectedProposalId: null 
    }))
  }, [logger])

  // View mode actions
  const setViewMode = useCallback((mode: 'grid' | 'list' | 'kanban') => {
    logger.debug('Setting view mode', { mode })
    setState(prev => ({ ...prev, viewMode: mode }))
  }, [logger])

  // Bulk actions
  const toggleBulkActionMode = useCallback(() => {
    logger.debug('Toggling bulk action mode')
    setState(prev => ({ 
      ...prev, 
      isBulkActionMode: !prev.isBulkActionMode,
      selectedProposalIds: []
    }))
  }, [logger])

  const toggleProposalSelection = useCallback((proposalId: string) => {
    setState(prev => {
      const isSelected = prev.selectedProposalIds.includes(proposalId)
      const newSelected = isSelected
        ? prev.selectedProposalIds.filter(id => id !== proposalId)
        : [...prev.selectedProposalIds, proposalId]
      
      logger.debug('Toggling proposal selection', { 
        proposalId, 
        isSelected, 
        newCount: newSelected.length 
      })
      
      return { ...prev, selectedProposalIds: newSelected }
    })
  }, [logger])

  const selectAllProposals = useCallback((proposalIds: string[]) => {
    logger.debug('Selecting all proposals', { count: proposalIds.length })
    setState(prev => ({ ...prev, selectedProposalIds: proposalIds }))
  }, [logger])

  const clearSelection = useCallback(() => {
    logger.debug('Clearing proposal selection')
    setState(prev => ({ ...prev, selectedProposalIds: [] }))
  }, [logger])

  // Legacy actions for backward compatibility
  const openRecurrentBuilder = useCallback(() => {
    setState(prev => ({ ...prev, isRecurrentBuilderOpen: true }))
  }, [])

  const closeRecurrentBuilder = useCallback(() => {
    setState(prev => ({ ...prev, isRecurrentBuilderOpen: false }))
  }, [])

  const openSpecificBuilder = useCallback(() => {
    setState(prev => ({ ...prev, isSpecificBuilderOpen: true }))
  }, [])

  const closeSpecificBuilder = useCallback(() => {
    setState(prev => ({ ...prev, isSpecificBuilderOpen: false }))
  }, [])

  const openEditProposal = useCallback((proposal: any) => {
    setState(prev => ({ 
      ...prev, 
      isEditMode: true, 
      editingProposal: proposal 
    }))
  }, [])

  const closeEditProposal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isEditMode: false, 
      editingProposal: null 
    }))
  }, [])

  return {
    // State
    ...state,
    
    // Dialog actions
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    
    // View actions
    setViewMode,
    
    // Bulk actions
    toggleBulkActionMode,
    toggleProposalSelection,
    selectAllProposals,
    clearSelection,
    
    // Legacy actions
    openRecurrentBuilder,
    closeRecurrentBuilder,
    openSpecificBuilder,
    closeSpecificBuilder,
    openEditProposal,
    closeEditProposal,
  }
}