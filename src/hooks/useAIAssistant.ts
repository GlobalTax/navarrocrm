
import { useState } from 'react'

export const useAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const toggle = () => {
    if (isOpen && !isMinimized) {
      setIsOpen(false)
      setIsMinimized(false)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const minimize = () => {
    setIsMinimized(true)
  }

  const close = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  return {
    isOpen,
    isMinimized,
    toggle,
    minimize,
    close
  }
}
