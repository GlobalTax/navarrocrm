
import { useState, useEffect, useRef } from 'react'

interface LazyImageState {
  src: string
  isLoading: boolean
  isError: boolean
  isLoaded: boolean
}

export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageState, setImageState] = useState<LazyImageState>({
    src: placeholder || '',
    isLoading: true,
    isError: false,
    isLoaded: false
  })

  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    
    img.onload = () => {
      setImageState({
        src,
        isLoading: false,
        isError: false,
        isLoaded: true
      })
    }

    img.onerror = () => {
      setImageState({
        src: placeholder || '',
        isLoading: false,
        isError: true,
        isLoaded: false
      })
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, placeholder])

  const retry = () => {
    setImageState(prev => ({ ...prev, isLoading: true, isError: false }))
    // El useEffect se encargará de recargar
  }

  return {
    imgRef,
    ...imageState,
    retry
  }
}
