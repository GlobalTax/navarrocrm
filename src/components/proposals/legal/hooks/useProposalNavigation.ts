
import { useState, useCallback } from 'react'
import { LegalProposalData } from '../types/legalProposal.types'

interface UseProposalNavigationProps {
  proposalData: LegalProposalData
}

export const useProposalNavigation = ({ proposalData }: UseProposalNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1: 
        return Boolean(proposalData.clientId && proposalData.clientId.trim() !== '')
      
      case 2: 
        return Boolean(
          proposalData.selectedArea && 
          proposalData.selectedArea.trim() !== '' && 
          proposalData.selectedServices && 
          Array.isArray(proposalData.selectedServices) && 
          proposalData.selectedServices.length > 0
        )
      
      case 3: 
        return Boolean(
          proposalData.retainerConfig && 
          typeof proposalData.retainerConfig.retainerAmount === 'number' && 
          proposalData.retainerConfig.retainerAmount > 0
        )
      
      case 4: 
        return Boolean(proposalData.title && proposalData.title.trim() !== '')
      
      case 5: 
        return true // Preview step always valid if we reach it
      
      default: 
        return false
    }
  }, [proposalData])

  const canProceed = useCallback(() => {
    return validateStep(currentStep)
  }, [currentStep, validateStep])

  const getStepValidationMessage = useCallback((step: number): string => {
    switch (step) {
      case 1:
        return !proposalData.clientId ? 'Selecciona un cliente para continuar' : ''
      case 2:
        if (!proposalData.selectedArea) return 'Selecciona un área de práctica'
        if (!proposalData.selectedServices?.length) return 'Selecciona al menos un servicio'
        return ''
      case 3:
        return !proposalData.retainerConfig?.retainerAmount ? 'Configura el importe de los honorarios' : ''
      case 4:
        return !proposalData.title ? 'Introduce un título para la propuesta' : ''
      default:
        return ''
    }
  }, [proposalData])

  return {
    currentStep,
    setCurrentStep,
    showSuccess,
    setShowSuccess,
    canProceed,
    validateStep,
    getStepValidationMessage
  }
}
