import { useState, useCallback, memo } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

export const LazyImage = memo(({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/placeholder.svg',
  onLoad,
  onError 
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    setImageSrc(fallbackSrc)
    onError?.()
  }, [fallbackSrc, onError])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'filter grayscale',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  )
})

LazyImage.displayName = 'LazyImage'