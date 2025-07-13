import { useEffect, useRef } from 'react'
import { useLogger } from './useLogger'

interface AccessibilityOptions {
  announceRoute?: boolean
  focusManagement?: boolean
  keyboardNavigation?: boolean
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const { announceRoute = true, focusManagement = true, keyboardNavigation = true } = options
  const logger = useLogger('Accessibility')
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Announce route changes for screen readers
  const announceRouteChange = (routeName: string) => {
    if (!announceRoute) return
    
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = `Navegando a ${routeName}`
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
    
    logger.debug('Route announced', { route: routeName })
  }

  // Focus management for modals and dialogs
  const trapFocus = (element: HTMLElement) => {
    if (!focusManagement) return

    previousFocusRef.current = document.activeElement as HTMLElement
    
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    element.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleTab)
      previousFocusRef.current?.focus()
    }
  }

  // Enhanced keyboard navigation
  const enhanceKeyboardNav = () => {
    if (!keyboardNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key handling
      if (e.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]') as HTMLElement
        if (modal) {
          const closeButton = modal.querySelector('[data-close]') as HTMLElement
          closeButton?.click()
        }
      }

      // Alt + M for main menu
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        const mainMenu = document.querySelector('[data-main-menu]') as HTMLElement
        mainMenu?.focus()
        logger.debug('Main menu focused via keyboard shortcut')
      }

      // Alt + S for search
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        const searchInput = document.querySelector('[data-search]') as HTMLElement
        searchInput?.focus()
        logger.debug('Search focused via keyboard shortcut')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }

  useEffect(() => {
    const cleanup = enhanceKeyboardNav()
    return cleanup
  }, [keyboardNavigation])

  return {
    announceRouteChange,
    trapFocus,
    enhanceKeyboardNav
  }
}