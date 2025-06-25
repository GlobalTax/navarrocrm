
import React from 'react'
import { useImageWithPlaceholder } from '@/hooks/image/useImageWithPlaceholder'
import { ImageOptions } from '@/services/image/ImageOptimizer'

interface ImageWithPlaceholderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  options?: ImageOptions
  fallback?: React.ReactNode
}

export const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  options = {},
  className = '',
  style,
  fallback,
  ...props
}) => {
  const {
    src: imageSrc,
    showPlaceholder,
    isLoaded,
    isError
  } = useImageWithPlaceholder(src, options)

  if (isError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        {fallback || (
          <div className="text-center p-4">
            <p className="text-gray-500 text-sm">Error al cargar imagen</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} transition-all duration-500 ${
          showPlaceholder ? 'blur-sm scale-110' : 'blur-none scale-100'
        }`}
        style={style}
        loading="lazy"
        decoding="async"
        {...props}
      />
      {showPlaceholder && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
    </div>
  )
}
