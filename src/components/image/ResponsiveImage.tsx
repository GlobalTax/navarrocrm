
import React from 'react'
import { useResponsiveImage } from '@/hooks/image/useResponsiveImage'
import { ImageOptions } from '@/services/image/ImageOptimizer'
import { Skeleton } from '@/components/ui/skeleton'

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  options?: ImageOptions
  fallback?: React.ReactNode
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  options = { responsive: true },
  className = '',
  style,
  fallback,
  ...props
}) => {
  const {
    src: optimizedSrc,
    srcSet,
    sizes,
    isLoading,
    isError
  } = useResponsiveImage(src, { ...options, responsive: true })

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

  if (isLoading) {
    return <Skeleton className={className} style={style} />
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      style={style}
      srcSet={srcSet}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
