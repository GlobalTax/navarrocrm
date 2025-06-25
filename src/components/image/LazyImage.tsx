
import React from 'react'
import { useLazyImage } from '@/hooks/image/useLazyImage'
import { ImageOptions } from '@/services/image/ImageOptimizer'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  options?: ImageOptions
  fallback?: React.ReactNode
  showSkeleton?: boolean
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  options = { placeholder: 'blur' },
  className = '',
  style,
  fallback,
  showSkeleton = true,
  ...props
}) => {
  const {
    imgRef,
    src: imageSrc,
    isLoaded,
    isVisible,
    isError,
    retry
  } = useLazyImage(src, options)

  if (isError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        {fallback || (
          <div className="text-center p-4">
            <p className="text-gray-500 text-sm mb-2">Error al cargar imagen</p>
            <button 
              onClick={retry}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!isVisible && showSkeleton) {
    return <Skeleton className={className} style={style} />
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'}`}
      style={style}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
