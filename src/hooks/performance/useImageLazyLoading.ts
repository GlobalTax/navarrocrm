
import { useCallback, useEffect, useRef, useState } from 'react'
import { useIntersectionObserver } from './useIntersectionObserver'
import { useLogger } from '@/hooks/useLogger'

interface ImageLazyLoadingOptions {
  placeholder?: string
  threshold?: number
  rootMargin?: string
  enableBlur?: boolean
}

export const useImageLazyLoading = (
  src: string,
  options: ImageLazyLoadingOptions = {}
) => {
  const {
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYiIvPjwvc3ZnPg==',
    threshold = 0.1,
    rootMargin = '50px',
    enableBlur = true
  } = options

  const logger = useLogger('ImageLazyLoading')
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(placeholder)
  const imgRef = useRef<HTMLImageElement>(null)

  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin
  })

  const loadImage = useCallback(() => {
    if (!src || isLoaded || hasError) return

    const img = new Image()
    
    img.onload = () => {
      setCurrentSrc(src)
      setIsLoaded(true)
      logger.debug('✅ Imagen cargada', { src })
    }

    img.onerror = () => {
      setHasError(true)
      logger.warn('❌ Error cargando imagen', { src })
    }

    img.src = src
  }, [src, isLoaded, hasError, logger])

  useEffect(() => {
    if (isIntersecting && !isLoaded && !hasError) {
      loadImage()
    }
  }, [isIntersecting, loadImage, isLoaded, hasError])

  // Cleanup cuando el componente se desmonta o sale del viewport
  useEffect(() => {
    const imgElement = imgRef.current
    
    return () => {
      if (imgElement && !isIntersecting) {
        // Liberar memoria si la imagen está fuera del viewport
        imgElement.src = placeholder
        logger.debug('🧹 Imagen liberada de memoria', { originalSrc: src })
      }
    }
  }, [isIntersecting, placeholder, src, logger])

  const imageProps = {
    ref: imgRef,
    src: currentSrc,
    style: {
      filter: enableBlur && !isLoaded ? 'blur(4px)' : 'none',
      transition: 'filter 0.3s ease-out'
    },
    'data-lazy': 'true',
    'data-loaded': isLoaded
  }

  return {
    ref: targetRef,
    imageProps,
    isLoaded,
    hasError,
    isIntersecting
  }
}
