
import { useState, useEffect, useCallback, useRef } from 'react'
import { ImageOptimizer, ImageOptions } from '@/services/image/ImageOptimizer'

interface ImageState {
  isLoaded: boolean
  isError: boolean
  isLoading: boolean
  naturalWidth: number
  naturalHeight: number
  aspectRatio: number
}

export const useImageOptimization = (
  originalSrc: string,
  options: ImageOptions = {}
) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('')
  const [srcSet, setSrcSet] = useState<string>('')
  const [placeholder, setPlaceholder] = useState<string>('')
  const [state, setState] = useState<ImageState>({
    isLoaded: false,
    isError: false,
    isLoading: true,
    naturalWidth: 0,
    naturalHeight: 0,
    aspectRatio: 0
  })

  const imgRef = useRef<HTMLImageElement>(null)
  const optimizerRef = useRef(ImageOptimizer.getInstance())

  // Optimizar imagen principal
  const optimizeImage = useCallback(async () => {
    if (!originalSrc) return

    setState(prev => ({ ...prev, isLoading: true, isError: false }))

    try {
      // Generar URL optimizada
      const optimized = await optimizerRef.current.generateOptimizedUrl(originalSrc, options)
      setOptimizedSrc(optimized)

      // Generar srcSet si es responsive
      if (options.responsive) {
        const srcSetString = await optimizerRef.current.generateSrcSet(originalSrc, undefined, options)
        setSrcSet(srcSetString)
      }

      // Generar placeholder si se solicita
      if (options.placeholder === 'blur') {
        const placeholderUrl = await optimizerRef.current.generatePlaceholder(originalSrc)
        setPlaceholder(placeholderUrl)
      }

      setState(prev => ({ ...prev, isLoading: false }))
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, isError: true }))
      console.error('Error optimizing image:', error)
    }
  }, [originalSrc, JSON.stringify(options)])

  // Cargar imagen y actualizar estado
  const loadImage = useCallback(() => {
    if (!optimizedSrc) return

    const img = new Image()
    
    img.onload = () => {
      setState(prev => ({
        ...prev,
        isLoaded: true,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      }))
    }

    img.onerror = () => {
      setState(prev => ({ ...prev, isError: true, isLoading: false }))
    }

    img.src = optimizedSrc
  }, [optimizedSrc])

  // Efecto para optimizar imagen
  useEffect(() => {
    if (originalSrc) {
      optimizeImage()
    }
  }, [optimizeImage])

  // Efecto para cargar imagen
  useEffect(() => {
    if (optimizedSrc && !options.lazy) {
      loadImage()
    }
  }, [optimizedSrc, options.lazy, loadImage])

  return {
    imgRef,
    optimizedSrc,
    srcSet,
    placeholder,
    ...state,
    retry: optimizeImage,
    loadImage
  }
}
