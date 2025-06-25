
import { useState, useEffect, useRef } from 'react'
import { ImageOptimizer, ImageOptions } from '@/services/image/ImageOptimizer'

export const useLazyImage = (
  src: string,
  options: ImageOptions = {}
) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [optimizedSrc, setOptimizedSrc] = useState<string>('')
  const [placeholder, setPlaceholder] = useState<string>('')

  const imgRef = useRef<HTMLImageElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const optimizerRef = useRef(ImageOptimizer.getInstance())

  // Setup Intersection Observer para lazy loading
  useEffect(() => {
    if (!imgRef.current || isVisible) return

    const cleanup = optimizerRef.current.setupLazyLoading(
      imgRef.current,
      () => setIsVisible(true)
    )

    cleanupRef.current = cleanup

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [isVisible])

  // Generar placeholder cuando el componente se monta
  useEffect(() => {
    const generatePlaceholder = async () => {
      if (src && options.placeholder === 'blur') {
        try {
          const placeholderUrl = await optimizerRef.current.generatePlaceholder(src)
          setPlaceholder(placeholderUrl)
        } catch (error) {
          console.warn('Failed to generate placeholder:', error)
        }
      }
    }

    generatePlaceholder()
  }, [src, options.placeholder])

  // Optimizar y cargar imagen cuando sea visible
  useEffect(() => {
    if (!isVisible || !src) return

    const loadOptimizedImage = async () => {
      try {
        const optimized = await optimizerRef.current.generateOptimizedUrl(src, options)
        setOptimizedSrc(optimized)

        // Precargar imagen
        const img = new Image()
        img.onload = () => setIsLoaded(true)
        img.onerror = () => setIsError(true)
        img.src = optimized
      } catch (error) {
        setIsError(true)
        console.error('Error loading lazy image:', error)
      }
    }

    loadOptimizedImage()
  }, [isVisible, src, JSON.stringify(options)])

  const retry = () => {
    setIsError(false)
    setIsLoaded(false)
    setIsVisible(false)
  }

  return {
    imgRef,
    src: isLoaded ? optimizedSrc : placeholder,
    isLoaded,
    isVisible,
    isError,
    retry
  }
}
