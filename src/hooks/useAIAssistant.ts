
import { useState } from 'react'

export const useAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false) // Cambiado a false por defecto
  const [isMinimized, setIsMinimized] = useState(false)

  console.log('🪝 useAIAssistant - Estado actual:', { isOpen, isMinimized })

  const toggle = () => {
    console.log('🔄 useAIAssistant - Toggle llamado')
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const minimize = () => {
    console.log('📦 useAIAssistant - Minimize llamado')
    setIsOpen(false)
    setIsMinimized(false)
  }

  const close = () => {
    console.log('❌ useAIAssistant - Close llamado')
    setIsOpen(false)
    setIsMinimized(false)
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
