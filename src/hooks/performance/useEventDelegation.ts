
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface EventStats {
  totalListeners: number
  delegatedListeners: number
  directListeners: number
  duplicateListeners: number
  memoryUsage: number
}

interface DelegationRule {
  selector: string
  event: string
  handler: (event: Event) => void
  active: boolean
}

export const useEventDelegation = () => {
  const [stats, setStats] = useState<EventStats>({
    totalListeners: 0,
    delegatedListeners: 0,
    directListeners: 0,
    duplicateListeners: 0,
    memoryUsage: 0
  })
  
  const [rules, setRules] = useState<Map<string, DelegationRule>>(new Map())
  const logger = useLogger('EventDelegation')
  const delegatedHandlers = useRef<Map<string, (event: Event) => void>>(new Map())

  const analyzeEventListeners = useCallback(() => {
    // This is a simplified analysis - in a real implementation,
    // you'd need access to browser internals or dev tools API
    
    const elements = document.querySelectorAll('*')
    let totalListeners = 0
    let directListeners = 0
    
    elements.forEach(element => {
      // Estimate listeners based on common patterns
      const tagName = element.tagName.toLowerCase()
      const hasOnClick = element.hasAttribute('onclick')
      const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(tagName)
      
      if (hasOnClick || isInteractive) {
        totalListeners++
        directListeners++
      }
    })

    const delegatedListeners = rules.size
    const duplicateListeners = Math.max(0, directListeners - delegatedListeners)
    const memoryUsage = (totalListeners * 1024) + (delegatedListeners * 512) // Rough estimate

    const newStats = {
      totalListeners,
      delegatedListeners,
      directListeners,
      duplicateListeners,
      memoryUsage
    }

    setStats(newStats)

    logger.info('👂 Event listeners analyzed', {
      total: totalListeners,
      delegated: delegatedListeners,
      direct: directListeners,
      memory: `${(memoryUsage / 1024).toFixed(1)}KB`
    })

    return newStats
  }, [rules.size, logger])

  const createDelegatedHandler = useCallback((
    containerSelector: string,
    targetSelector: string,
    eventType: string,
    handler: (event: Event, target: Element) => void
  ) => {
    const ruleKey = `${containerSelector}:${targetSelector}:${eventType}`
    
    if (rules.has(ruleKey)) {
      logger.warn('🔄 Delegated handler already exists', { ruleKey })
      return () => {} // Return empty cleanup function
    }

    const delegatedHandler = (event: Event) => {
      const target = event.target as Element
      if (target && target.matches(targetSelector)) {
        handler(event, target)
      }
    }

    const container = document.querySelector(containerSelector)
    if (!container) {
      logger.error('❌ Container not found for delegation', { containerSelector })
      return () => {}
    }

    container.addEventListener(eventType, delegatedHandler, { passive: true })
    delegatedHandlers.current.set(ruleKey, delegatedHandler)

    const rule: DelegationRule = {
      selector: `${containerSelector} ${targetSelector}`,
      event: eventType,
      handler: delegatedHandler,
      active: true
    }

    setRules(prev => new Map(prev).set(ruleKey, rule))

    logger.info('✅ Event delegation created', {
      container: containerSelector,
      target: targetSelector,
      event: eventType
    })

    // Return cleanup function
    return () => {
      container.removeEventListener(eventType, delegatedHandler)
      delegatedHandlers.current.delete(ruleKey)
      setRules(prev => {
        const newRules = new Map(prev)
        newRules.delete(ruleKey)
        return newRules
      })
    }
  }, [rules, logger])

  const optimizeCommonPatterns = useCallback(() => {
    const optimizations: (() => void)[] = []

    // Delegate button clicks
    const buttons = document.querySelectorAll('button[onclick], button:not([data-delegated])')
    if (buttons.length > 5) {
      const cleanup = createDelegatedHandler(
        'body',
        'button:not([data-no-delegate])',
        'click',
        (event, target) => {
          // Preserve original onclick behavior
          const onclick = target.getAttribute('onclick')
          if (onclick) {
            try {
              new Function('event', onclick).call(target, event)
            } catch (error) {
              logger.error('Delegated onclick failed', { error })
            }
          }
        }
      )
      optimizations.push(cleanup)
    }

    // Delegate form interactions
    const formElements = document.querySelectorAll('input, select, textarea')
    if (formElements.length > 10) {
      const cleanup = createDelegatedHandler(
        'body',
        'input, select, textarea',
        'change',
        (event, target) => {
          // Custom form handling logic can be added here
          logger.debug('Form element changed', { 
            tag: target.tagName,
            type: target.getAttribute('type')
          })
        }
      )
      optimizations.push(cleanup)
    }

    // Delegate link clicks for SPA routing
    const links = document.querySelectorAll('a[href^="/"], a[data-route]')
    if (links.length > 3) {
      const cleanup = createDelegatedHandler(
        'body',
        'a[href^="/"], a[data-route]',
        'click',
        (event, target) => {
          const href = target.getAttribute('href') || target.getAttribute('data-route')
          if (href && !target.hasAttribute('target')) {
            // This would integrate with your router
            logger.debug('Internal link clicked', { href })
          }
        }
      )
      optimizations.push(cleanup)
    }

    return () => {
      optimizations.forEach(cleanup => cleanup())
    }
  }, [createDelegatedHandler, logger])

  useEffect(() => {
    analyzeEventListeners()
    
    const cleanup = optimizeCommonPatterns()
    
    // Re-analyze periodically
    const interval = setInterval(analyzeEventListeners, 15000)

    return () => {
      clearInterval(interval)
      cleanup()
    }
  }, [analyzeEventListeners, optimizeCommonPatterns])

  const getOptimizationReport = () => {
    const potentialSavings = stats.directListeners * 0.6 // Assume 60% can be delegated
    const memoryReduction = potentialSavings * 512 // Bytes per listener saved

    return {
      currentStats: stats,
      potentialSavings: {
        listeners: Math.floor(potentialSavings),
        memory: `${(memoryReduction / 1024).toFixed(1)}KB`
      },
      activeDelegations: Array.from(rules.values()),
      recommendations: [
        stats.directListeners > 20 && 'Consider delegating more event listeners',
        stats.duplicateListeners > 5 && 'Remove duplicate event listeners',
        stats.memoryUsage > 50 * 1024 && 'Event listener memory usage is high'
      ].filter(Boolean)
    }
  }

  return {
    stats,
    rules,
    createDelegatedHandler,
    analyzeEventListeners,
    getOptimizationReport
  }
}
