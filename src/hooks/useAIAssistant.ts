
import { useState } from 'react'

export const useAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(true) // Siempre abierto por defecto
  const [isMinimized, setIsMinimized] = useState(false)

  console.log('🪝 useAIAssistant - Estado actual:', { isOpen, isMinimized })

  const toggle = () => {
    console.log('🔄 useAIAssistant - Toggle llamado')
    if (isOpen && !isMinimized) {
      console.log('📦 useAIAssistant - Minimizando...')
      setIsMinimized(true)
    } else {
      console.log('📖 useAIAssistant - Maximizando...')
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const minimize = () => {
    console.log('📦 useAIAssistant - Minimize llamado')
    setIsMinimized(true)
  }

  const close = () => {
    console.log('📦 useAIAssistant - Close llamado (convertido a minimize)')
    setIsMinimized(true) // En lugar de cerrar, solo minimizar
  }

  const maximize = () => {
    console.log('📖 useAIAssistant - Maximize llamado')
    setIsOpen(true)
    setIsMinimized(false)
  }

  return {
    isOpen,
    isMinimized,
    toggle,
    minimize,
    close,
    maximize
  }
}
