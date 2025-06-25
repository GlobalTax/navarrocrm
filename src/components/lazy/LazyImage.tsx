
import React from 'react'
import { useLazyImage } from '@/hooks/lazy'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  placeholder?: string
  fallback?: React.ReactNode
}

export const LazyImage = ({ 
  src, 
  placeholder, 
  fallback, 
  className = '', 
  alt = '',
  ...props 
}: LazyImageProps) => {
  const { imgRef, src: imageSrc, isLoading, isError, isLoaded, retry } = useLazyImage(src, placeholder)

  if (isError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
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

  if (isLoading && !imageSrc) {
    return <Skeleton className={className} />
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      {...props}
    />
  )
}
