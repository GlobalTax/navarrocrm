
import { useState } from 'react'
import { aiLogger } from '@/utils/logging'

export const useAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false) // Cambiado a false por defecto
  const [isMinimized, setIsMinimized] = useState(false)

  aiLogger.debug('Estado actual', { isOpen, isMinimized })

  const toggle = () => {
    aiLogger.debug('Toggle llamado')
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const minimize = () => {
    aiLogger.debug('Minimize llamado')
    setIsOpen(false)
    setIsMinimized(false)
  }

  const close = () => {
    aiLogger.debug('Close llamado')
    setIsOpen(false)
    setIsMinimized(false)
  }

  const maximize = () => {
    aiLogger.debug('Maximize llamado')
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
