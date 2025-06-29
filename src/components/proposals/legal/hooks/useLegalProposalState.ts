
import { useState, useCallback } from 'react'
import { LegalProposalData, SelectedService } from '../types/legalProposal.types'
import { convertServiceToSelected, updateServiceTotal } from '../utils/serviceConversion'
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
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)

  const updateProposalData = useCallback((field: keyof LegalProposalData, value: any) => {
    setProposalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAreaChange = useCallback((areaId: string) => {
    setProposalData(prev => ({
      ...prev,
      selectedArea: areaId,
      selectedServices: [] // Clear services when area changes
    }))
  }, [])

  const handleServiceToggle = useCallback((serviceId: string, serviceData: any) => {
    setProposalData(prev => {
      const isCurrentlySelected = prev.selectedServices.some(s => s.id === serviceId)
      
      if (isCurrentlySelected) {
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter(s => s.id !== serviceId)
        }
      } else {
        const selectedService = convertServiceToSelected(serviceData)
        return {
          ...prev,
          selectedServices: [...prev.selectedServices, selectedService]
        }
      }
    })
  }, [])

  const handleServiceUpdate = useCallback((serviceId: string, field: keyof SelectedService, value: any) => {
    setProposalData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.map(service => {
        if (service.id === serviceId) {
          const updated = { ...service, [field]: value }
          return updateServiceTotal(updated)
        }
        return service
      })
    }))
  }, [])

  const handleServiceRemove = useCallback((serviceId: string) => {
    setProposalData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(s => s.id !== serviceId)
    }))
  }, [])

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return Boolean(proposalData.clientId)
      case 2:
        return Boolean(proposalData.selectedArea && proposalData.selectedServices.length > 0)
      case 3:
        return Boolean(proposalData.retainerConfig.retainerAmount > 0)
      case 4:
        return Boolean(proposalData.title && proposalData.introduction)
      case 5:
        return true
      default:
        return false
    }
  }, [currentStep, proposalData])

  return {
    // State
    proposalData,
    currentStep,
    showSuccess,
    
    // Actions
    updateProposalData,
    setCurrentStep,
    setShowSuccess,
    handleAreaChange,
    handleServiceToggle,
    handleServiceUpdate,
    handleServiceRemove,
    
    // Computed
    canProceed,
    selectedServiceIds: proposalData.selectedServices.map(s => s.id),
    
    // Data
    practiceAreasData
  }
}
