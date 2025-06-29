
import { useState } from 'react'
import { LegalProposalData } from '../types/legalProposal.types'
import { useServiceManagement } from './useServiceManagement'
import { useProposalNavigation } from './useProposalNavigation'
import { practiceAreasData } from '../data/practiceAreasData'

const initialProposalData: LegalProposalData = {
  clientId: '',
  selectedArea: '',
  selectedServices: [],
  retainerConfig: {
    retainerAmount: 300,
    includedHours: 8,
    extraHourlyRate: 75,
    billingFrequency: 'monthly',
    billingDay: 1,
    autoRenewal: true,
    contractDuration: 12,
    paymentTerms: 30
  },
  title: '',
  introduction: '',
  terms: '',
  validityDays: 30
}

export const useLegalProposalState = () => {
  const [proposalData, setProposalData] = useState<LegalProposalData>(initialProposalData)

  const updateProposalData = (field: keyof LegalProposalData, value: any) => {
    console.log('Updating proposal data:', field, value)
    setProposalData(prev => ({ ...prev, [field]: value }))
  }

  const navigation = useProposalNavigation({ proposalData })
  
  const serviceManagement = useServiceManagement({
    initialServices: proposalData.selectedServices,
    onServicesChange: (services) => updateProposalData('selectedServices', services),
    selectedArea: proposalData.selectedArea,
    updateProposalData
  })

  // Handler combinado para área y servicios - usado por el selector
  const handleAreaAndServicesChange = (areaId: string, serviceIds?: string[]) => {
    console.log('useLegalProposalState - handleAreaAndServicesChange:', areaId, serviceIds)
    
    if (areaId !== proposalData.selectedArea) {
      // Cambio de área - usar el handler específico
      serviceManagement.handleAreaChange(areaId)
    }
    
    // Si se proporcionan serviceIds, esto es un toggle de servicio individual
    // No hacer nada aquí, dejar que el componente maneje el toggle individualmente
  }

  return {
    // State
    proposalData,
    setProposalData,
    updateProposalData,
    
    // Navigation
    currentStep: navigation.currentStep,
    setCurrentStep: navigation.setCurrentStep,
    showSuccess: navigation.showSuccess,
    setShowSuccess: navigation.setShowSuccess,
    canProceed: navigation.canProceed,
    
    // Service Management
    handleAreaAndServicesChange,
    handleServiceToggle: serviceManagement.handleServiceToggle,
    handleServiceUpdate: serviceManagement.handleServiceUpdate,
    handleServiceRemove: serviceManagement.handleServiceRemove,
    handleServiceAdd: serviceManagement.handleServiceAdd,
    
    // Data
    practiceAreasData
  }
}
