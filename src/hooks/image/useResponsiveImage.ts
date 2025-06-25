
import { useState, useEffect, useRef } from 'react'
import { ImageOptimizer, ImageOptions } from '@/services/image/ImageOptimizer'

export const useResponsiveImage = (
  src: string,
  options: ImageOptions = {}
) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('')
  const [srcSet, setSrcSet] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const optimizerRef = useRef(ImageOptimizer.getInstance())

  // Generar sizes por defecto basado en breakpoints comunes
  const sizes = options.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

  useEffect(() => {
    const generateResponsiveImages = async () => {
      if (!src) return

      setIsLoading(true)
      setIsError(false)

      try {
        // Generar imagen optimizada principal
        const optimized = await optimizerRef.current.generateOptimizedUrl(src, options)
        setOptimizedSrc(optimized)

        // Generar srcSet para diferentes tamaños
        const srcSetString = await optimizerRef.current.generateSrcSet(src, undefined, options)
        setSrcSet(srcSetString)

        setIsLoading(false)
      } catch (error) {
        setIsError(true)
        setIsLoading(false)
        console.error('Error generating responsive images:', error)
      }
    }

    generateResponsiveImages()
  }, [src, JSON.stringify(options)])

  return {
    src: optimizedSrc,
    srcSet,
    sizes,
    isLoading,
    isError
  }
}
