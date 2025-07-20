import { useState, useCallback } from 'react'
import { 
  LegalProposalData, 
  SelectedService, 
  PracticeArea,
  LegalService 
} from '@/types/proposals'
import { updateServiceTotal } from '../utils/serviceConversion'
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
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [showSuccess, setShowSuccess] = useState<boolean>(false)

  const updateProposalData = useCallback((field: keyof LegalProposalData, value: any) => {
    setProposalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAreaChange = useCallback((areaId: string) => {
    setProposalData(prev => ({
      ...prev,
      selectedArea: areaId
      // Mantener servicios seleccionados al cambiar de área
    }))
  }, [])

  const handleServiceToggle = useCallback((serviceId: string, serviceData: LegalService) => {
    setProposalData(prev => {
      const isCurrentlySelected = prev.selectedServices.some(s => s.id === serviceId)
      
      if (isCurrentlySelected) {
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter(s => s.id !== serviceId)
        }
      } else {
        const selectedService: SelectedService = {
          ...serviceData,
          quantity: 1,
          customPrice: serviceData.price,
          notes: '',
          total: serviceData.price,
          basePrice: serviceData.price,
          billingUnit: 'hour'
        }
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

  const canProceed = useCallback((): boolean => {
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
    practiceAreasData: Object.values(practiceAreasData) as PracticeArea[]
  }
}