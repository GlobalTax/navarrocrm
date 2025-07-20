
import { useState } from 'react'
import { useLogger } from './useLogger'

export const useAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false) // Cambiado a false por defecto
  const [isMinimized, setIsMinimized] = useState(false)
  const logger = useLogger('useAIAssistant')

  logger.debug('Estado actual', { isOpen, isMinimized })

  const toggle = () => {
    logger.debug('Toggle llamado')
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const minimize = () => {
    logger.debug('Minimize llamado')
    setIsOpen(false)
    setIsMinimized(false)
  }

  const close = () => {
    logger.debug('Close llamado')
    setIsOpen(false)
    setIsMinimized(false)
  }

  const maximize = () => {
    logger.debug('Maximize llamado')
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
