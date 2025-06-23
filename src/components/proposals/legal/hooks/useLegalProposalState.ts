
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
    selectedServices: proposalData.selectedServices,
    selectedArea: proposalData.selectedArea,
    updateProposalData
  })

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
    handleAreaAndServicesChange: serviceManagement.handleAreaAndServicesChange,
    handleServiceUpdate: serviceManagement.handleServiceUpdate,
    handleServiceRemove: serviceManagement.handleServiceRemove,
    handleServiceAdd: serviceManagement.handleServiceAdd,
    
    // Data
    practiceAreasData
  }
}
