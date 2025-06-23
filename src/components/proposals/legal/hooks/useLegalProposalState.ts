
import { useState } from 'react'
import { LegalProposalData, SelectedService } from '../types/legalProposal.types'

// Data de servicios disponibles por área
const practiceAreasData = {
  fiscal: {
    name: 'Fiscal y Tributario',
    services: [
      {
        id: 'fiscal-1',
        name: 'Asesoría Fiscal Mensual',
        description: 'Gestión integral de obligaciones fiscales y tributarias',
        basePrice: 150,
        billingUnit: 'mes',
        estimatedHours: 8
      },
      {
        id: 'fiscal-2',
        name: 'Declaraciones Trimestrales',
        description: 'IVA, IRPF, Retenciones y otros impuestos periódicos',
        basePrice: 80,
        billingUnit: 'trimestre',
        estimatedHours: 4
      },
      {
        id: 'fiscal-3',
        name: 'Renta Anual',
        description: 'Declaración anual de la renta y patrimonio',
        basePrice: 200,
        billingUnit: 'año',
        estimatedHours: 6
      }
    ]
  },
  laboral: {
    name: 'Laboral y Seguridad Social',
    services: [
      {
        id: 'laboral-1',
        name: 'Asesoría Laboral Integral',
        description: 'Gestión de nóminas, contratos y Seguridad Social',
        basePrice: 120,
        billingUnit: 'mes',
        estimatedHours: 10
      },
      {
        id: 'laboral-2',
        name: 'Gestión de Nóminas',
        description: 'Elaboración mensual de nóminas y seguros sociales',
        basePrice: 15,
        billingUnit: 'empleado/mes',
        estimatedHours: 1
      },
      {
        id: 'laboral-3',
        name: 'Representación Legal Laboral',
        description: 'Defensa en procedimientos laborales y Inspección',
        basePrice: 300,
        billingUnit: 'mes',
        estimatedHours: 5
      }
    ]
  },
  mercantil: {
    name: 'Mercantil y Societario',
    services: [
      {
        id: 'mercantil-1',
        name: 'Asesoría Societaria',
        description: 'Gestión de sociedades, juntas y documentación social',
        basePrice: 200,
        billingUnit: 'mes',
        estimatedHours: 6
      },
      {
        id: 'mercantil-2',
        name: 'Compliance Corporativo',
        description: 'Cumplimiento normativo y gobierno corporativo',
        basePrice: 400,
        billingUnit: 'mes',
        estimatedHours: 8
      }
    ]
  },
  civil: {
    name: 'Civil y Patrimonial',
    services: [
      {
        id: 'civil-1',
        name: 'Asesoría Patrimonial',
        description: 'Gestión integral del patrimonio familiar y empresarial',
        basePrice: 250,
        billingUnit: 'mes',
        estimatedHours: 5
      }
    ]
  }
}

export const useLegalProposalState = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [proposalData, setProposalData] = useState<LegalProposalData>({
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
  })

  const updateProposalData = (field: keyof LegalProposalData, value: any) => {
    console.log('Updating proposal data:', field, value)
    setProposalData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return proposalData.clientId !== ''
      case 2: return proposalData.selectedArea !== '' && proposalData.selectedServices.length > 0
      case 3: return proposalData.retainerConfig.retainerAmount > 0
      case 4: return proposalData.title !== ''
      case 5: return true
      default: return false
    }
  }

  // Función para convertir IDs de servicios a objetos SelectedService completos
  const convertServiceIdsToSelectedServices = (serviceIds: string[], areaId: string): SelectedService[] => {
    console.log('Converting services:', { serviceIds, areaId })
    
    const areaData = practiceAreasData[areaId as keyof typeof practiceAreasData]
    if (!areaData) {
      console.error('Area not found:', areaId)
      return []
    }

    const convertedServices = serviceIds.map(serviceId => {
      const serviceData = areaData.services.find(s => s.id === serviceId)
      if (!serviceData) {
        console.error('Service not found:', serviceId)
        return null
      }

      const selectedService: SelectedService = {
        id: serviceData.id,
        name: serviceData.name,
        description: serviceData.description,
        basePrice: serviceData.basePrice,
        customPrice: serviceData.basePrice,
        quantity: 1,
        billingUnit: serviceData.billingUnit,
        estimatedHours: serviceData.estimatedHours,
        total: serviceData.basePrice * 1
      }

      console.log('Converted service:', selectedService)
      return selectedService
    }).filter(Boolean) as SelectedService[]

    console.log('All converted services:', convertedServices)
    return convertedServices
  }

  const handleAreaChange = (areaId: string) => {
    console.log('Handling area change:', areaId)
    setProposalData(prev => ({ 
      ...prev, 
      selectedArea: areaId,
      selectedServices: [] // Limpiar servicios al cambiar de área
    }))
  }

  const handleServicesChange = (serviceIds: string[]) => {
    console.log('Handling services change:', serviceIds)
    
    // Usar el área actual del estado
    if (proposalData.selectedArea) {
      const convertedServices = convertServiceIdsToSelectedServices(serviceIds, proposalData.selectedArea)
      setProposalData(prev => ({ ...prev, selectedServices: convertedServices }))
    } else {
      console.warn('No area selected, cannot convert services')
    }
  }

  // Nueva función que maneja área y servicios juntos para evitar problemas de sincronización
  const handleAreaAndServicesChange = (areaId: string, serviceIds: string[] = []) => {
    console.log('Handling area and services change:', { areaId, serviceIds })
    
    const convertedServices = serviceIds.length > 0 
      ? convertServiceIdsToSelectedServices(serviceIds, areaId)
      : []

    setProposalData(prev => ({
      ...prev,
      selectedArea: areaId,
      selectedServices: convertedServices
    }))
  }

  const handleServiceUpdate = (serviceId: string, field: keyof SelectedService, value: number) => {
    console.log('Updating service:', { serviceId, field, value })
    
    setProposalData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.map(service => {
        if (service.id === serviceId) {
          const updated = { ...service, [field]: value }
          // Recalcular total si se cambia cantidad o precio
          if (field === 'quantity' || field === 'customPrice') {
            updated.total = updated.quantity * updated.customPrice
          }
          console.log('Updated service:', updated)
          return updated
        }
        return service
      })
    }))
  }

  const handleServiceRemove = (serviceId: string) => {
    console.log('Removing service:', serviceId)
    setProposalData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(service => service.id !== serviceId)
    }))
  }

  const handleServiceAdd = () => {
    console.log('Add new service - redirecting to step 2')
    setCurrentStep(2)
  }

  return {
    currentStep,
    setCurrentStep,
    showSuccess,
    setShowSuccess,
    proposalData,
    setProposalData,
    updateProposalData,
    canProceed,
    handleServicesChange,
    handleAreaChange,
    handleAreaAndServicesChange,
    handleServiceUpdate,
    handleServiceRemove,
    handleServiceAdd,
    practiceAreasData
  }
}
