
import { useState } from 'react'

export const useProposalsPageState = () => {
  const [isRecurrentBuilderOpen, setIsRecurrentBuilderOpen] = useState(false)
  const [isSpecificBuilderOpen, setIsSpecificBuilderOpen] = useState(false)

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

  return {
    // States
    isRecurrentBuilderOpen,
    isSpecificBuilderOpen,
    
    // Actions
    openRecurrentBuilder,
    closeRecurrentBuilder,
    openSpecificBuilder,
    closeSpecificBuilder
  }
}
