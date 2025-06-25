
import React from 'react'
import { useImageOptimization } from '@/hooks/image/useImageOptimization'
import { ImageOptions } from '@/services/image/ImageOptimizer'
import { Skeleton } from '@/components/ui/skeleton'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  options?: ImageOptions
  fallback?: React.ReactNode
  showSkeleton?: boolean
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  options = {},
  className = '',
  style,
  fallback,
  showSkeleton = true,
  ...props
}) => {
  const {
    imgRef,
    optimizedSrc,
    srcSet,
    placeholder,
    isLoaded,
    isError,
    isLoading,
    aspectRatio,
    retry
  } = useImageOptimization(src, options)

  // Calcular sizes por defecto si no se proporciona
  const sizes = options.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

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

  if (isLoading && showSkeleton) {
    return (
      <Skeleton 
        className={className} 
        style={{ 
          ...style, 
          aspectRatio: aspectRatio || undefined 
        }} 
      />
    )
  }

  return (
    <>
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt={`${alt} (placeholder)`}
          className={`${className} blur-sm transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={style}
          {...props}
        />
      )}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={style}
        srcSet={options.responsive ? srcSet : undefined}
        sizes={options.responsive ? sizes : undefined}
        loading={options.lazy ? 'lazy' : 'eager'}
        decoding="async"
        {...props}
      />
    </>
  )
}
