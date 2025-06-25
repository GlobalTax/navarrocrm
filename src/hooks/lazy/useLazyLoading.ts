
import { useState, useEffect, useRef, useCallback } from 'react'

interface LazyLoadingOptions {
  threshold?: number
  rootMargin?: string
  preloadDistance?: number
  debounceMs?: number
}

interface LazyLoadingState {
  isVisible: boolean
  isLoaded: boolean
  isError: boolean
  isLoading: boolean
}

export const useLazyLoading = (options: LazyLoadingOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    preloadDistance = 100,
    debounceMs = 100
  } = options

  const [state, setState] = useState<LazyLoadingState>({
    isVisible: false,
    isLoaded: false,
    isError: false,
    isLoading: false
  })

  const elementRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Función para cargar contenido
  const loadContent = useCallback(async () => {
    if (state.isLoaded || state.isLoading) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Simular carga de contenido
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setState(prev => ({
        ...prev,
        isLoaded: true,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isError: true,
        isLoading: false
      }))
    }
  }, [state.isLoaded, state.isLoading])

  // Función para preload
  const preload = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (state.isVisible && !state.isLoaded) {
        loadContent()
      }
    }, debounceMs)
  }, [state.isVisible, state.isLoaded, loadContent, debounceMs])

  // Configurar Intersection Observer
  useEffect(() => {
    if (!elementRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setState(prev => ({
            ...prev,
            isVisible: entry.isIntersecting
          }))

          if (entry.isIntersecting) {
            preload()
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observerRef.current.observe(elementRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [threshold, rootMargin, preload])

  // Cargar inmediatamente si es visible
  useEffect(() => {
    if (state.isVisible && !state.isLoaded) {
      loadContent()
    }
  }, [state.isVisible, state.isLoaded, loadContent])

  return {
    elementRef,
    ...state,
    loadContent,
    retry: () => {
      setState(prev => ({ ...prev, isError: false }))
      loadContent()
    }
  }
}
