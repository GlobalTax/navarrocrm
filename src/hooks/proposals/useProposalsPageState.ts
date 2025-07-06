
import { useState } from 'react'

export const useProposalsPageState = () => {
  const [isRecurrentBuilderOpen, setIsRecurrentBuilderOpen] = useState(false)
  const [isSpecificBuilderOpen, setIsSpecificBuilderOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProposal, setEditingProposal] = useState<any>(null)

  const openRecurrentBuilder = () => {
    console.log('Abriendo constructor de propuesta recurrente')
    setIsRecurrentBuilderOpen(true)
  }
  
  const closeRecurrentBuilder = () => {
    console.log('Cerrando constructor de propuesta recurrente')
    setIsRecurrentBuilderOpen(false)
  }
  
  const openSpecificBuilder = () => {
    console.log('Abriendo constructor de propuesta puntual')
    setIsSpecificBuilderOpen(true)
  }
  
  const closeSpecificBuilder = () => {
    console.log('Cerrando constructor de propuesta puntual')
    setIsSpecificBuilderOpen(false)
  }

  const openEditProposal = (proposal: any) => {
    console.log('Abriendo editor de propuesta:', proposal.title)
    setEditingProposal(proposal)
    setIsEditMode(true)
    // Abrir el formulario correcto según el tipo de propuesta
    if (proposal.is_recurring) {
      setIsRecurrentBuilderOpen(true)
    } else {
      setIsSpecificBuilderOpen(true)
    }
  }

  const closeEditProposal = () => {
    console.log('Cerrando editor de propuesta')
    setIsEditMode(false)
    setEditingProposal(null)
    setIsRecurrentBuilderOpen(false)
    setIsSpecificBuilderOpen(false)
  }

  return {
    // States
    isRecurrentBuilderOpen,
    isSpecificBuilderOpen,
    isEditMode,
    editingProposal,
    
    // Actions
    openRecurrentBuilder,
    closeRecurrentBuilder,
    openSpecificBuilder,
    closeSpecificBuilder,
    openEditProposal,
    closeEditProposal
  }
}
