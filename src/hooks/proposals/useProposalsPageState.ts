
import { useState } from 'react'

export const useProposalsPageState = () => {
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false)
  const [showEnhancedBuilder, setShowEnhancedBuilder] = useState(false)
  const [showProfessionalBuilder, setShowProfessionalBuilder] = useState(false)
  const [showAdvancedProfessionalBuilder, setShowAdvancedProfessionalBuilder] = useState(false)

  const openNewProposal = () => setIsNewProposalOpen(true)
  const closeNewProposal = () => setIsNewProposalOpen(false)
  
  const openEnhancedBuilder = () => {
    console.log('Propuesta Avanzada clicked')
    setShowEnhancedBuilder(true)
  }
  const closeEnhancedBuilder = () => {
    console.log('Volver a propuestas clicked')
    setShowEnhancedBuilder(false)
  }
  
  const openProfessionalBuilder = () => {
    console.log('Propuesta Profesional Simple clicked')
    setShowProfessionalBuilder(true)
  }
  const closeProfessionalBuilder = () => setShowProfessionalBuilder(false)
  
  const openAdvancedProfessionalBuilder = () => {
    console.log('Propuesta Profesional Completa clicked')
    setShowAdvancedProfessionalBuilder(true)
  }
  const closeAdvancedProfessionalBuilder = () => setShowAdvancedProfessionalBuilder(false)

  return {
    // States
    isNewProposalOpen,
    showEnhancedBuilder,
    showProfessionalBuilder,
    showAdvancedProfessionalBuilder,
    
    // Actions
    openNewProposal,
    closeNewProposal,
    openEnhancedBuilder,
    closeEnhancedBuilder,
    openProfessionalBuilder,
    closeProfessionalBuilder,
    openAdvancedProfessionalBuilder,
    closeAdvancedProfessionalBuilder
  }
}
