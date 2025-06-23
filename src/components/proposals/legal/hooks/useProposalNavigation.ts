
import { useState, useCallback } from 'react'
import { LegalProposalData } from '../types/legalProposal.types'

interface UseProposalNavigationProps {
  proposalData: LegalProposalData
}

export const useProposalNavigation = ({ proposalData }: UseProposalNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1: return proposalData.clientId !== ''
      case 2: return proposalData.selectedArea !== '' && proposalData.selectedServices.length > 0
      case 3: return proposalData.retainerConfig.retainerAmount > 0
      case 4: return proposalData.title !== ''
      case 5: return true
      default: return false
    }
  }, [currentStep, proposalData])

  return {
    currentStep,
    setCurrentStep,
    showSuccess,
    setShowSuccess,
    canProceed
  }
}
