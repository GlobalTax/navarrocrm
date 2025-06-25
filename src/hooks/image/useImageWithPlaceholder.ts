
import { useState, useEffect, useRef } from 'react'
import { ImageOptimizer, ImageOptions } from '@/services/image/ImageOptimizer'

export const useImageWithPlaceholder = (
  src: string,
  options: ImageOptions = {}
) => {
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [optimizedSrc, setOptimizedSrc] = useState<string>('')
  const [placeholder, setPlaceholder] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  const optimizerRef = useRef(ImageOptimizer.getInstance())

  useEffect(() => {
    const generateImages = async () => {
      if (!src) return

      try {
        // Generar placeholder inmediatamente
        const placeholderUrl = await optimizerRef.current.generatePlaceholder(src)
        setPlaceholder(placeholderUrl)

        // Generar imagen optimizada
        const optimized = await optimizerRef.current.generateOptimizedUrl(src, options)
        setOptimizedSrc(optimized)

        // Precargar imagen optimizada
        const img = new Image()
        img.onload = () => {
          setIsLoaded(true)
          // Delay para transición suave
          setTimeout(() => setShowPlaceholder(false), 100)
        }
        img.onerror = () => setIsError(true)
        img.src = optimized
      } catch (error) {
        setIsError(true)
        console.error('Error generating image with placeholder:', error)
      }
    }

    generateImages()
  }, [src, JSON.stringify(options)])

  return {
    src: showPlaceholder ? placeholder : optimizedSrc,
    showPlaceholder,
    isLoaded,
    isError,
    placeholder,
    optimizedSrc
  }
}
