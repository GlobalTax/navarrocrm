
import { useState } from 'react'

export const useProposalsPageState = () => {
  const [isBasicBuilderOpen, setIsBasicBuilderOpen] = useState(false)
  const [isProfessionalBuilderOpen, setIsProfessionalBuilderOpen] = useState(false)

  const openBasicBuilder = () => {
    console.log('Abriendo constructor básico')
    setIsBasicBuilderOpen(true)
  }
  
  const closeBasicBuilder = () => {
    console.log('Cerrando constructor básico')
    setIsBasicBuilderOpen(false)
  }
  
  const openProfessionalBuilder = () => {
    console.log('Abriendo constructor profesional')
    setIsProfessionalBuilderOpen(true)
  }
  
  const closeProfessionalBuilder = () => {
    console.log('Cerrando constructor profesional')
    setIsProfessionalBuilderOpen(false)
  }

  return {
    // States
    isBasicBuilderOpen,
    isProfessionalBuilderOpen,
    
    // Actions
    openBasicBuilder,
    closeBasicBuilder,
    openProfessionalBuilder,
    closeProfessionalBuilder
  }
}
