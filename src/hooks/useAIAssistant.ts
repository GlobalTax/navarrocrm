
import { useState } from 'react'

export const useAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(true) // Siempre abierto por defecto
  const [isMinimized, setIsMinimized] = useState(false)

  const toggle = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true) // Solo minimizar, no cerrar completamente
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const minimize = () => {
    setIsMinimized(true)
  }

  const close = () => {
    setIsMinimized(true) // En lugar de cerrar, solo minimizar
  }

  const maximize = () => {
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
