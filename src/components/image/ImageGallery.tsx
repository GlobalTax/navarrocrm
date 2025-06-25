
import React, { useState } from 'react'
import { OptimizedImage } from './OptimizedImage'
import { LazyImage } from './LazyImage'
import { ImageOptions } from '@/services/image/ImageOptimizer'

interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  options?: ImageOptions
  className?: string
  itemClassName?: string
  useLazy?: boolean
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  options = { responsive: true, quality: 85 },
  className = '',
  itemClassName = '',
  useLazy = true
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const ImageComponent = useLazy ? LazyImage : OptimizedImage

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`cursor-pointer transition-transform hover:scale-105 ${itemClassName}`}
            onClick={() => setSelectedIndex(index)}
          >
            <ImageComponent
              src={image.src}
              alt={image.alt}
              options={options}
              className="w-full h-64 object-cover rounded-lg"
            />
            {image.caption && (
              <p className="mt-2 text-sm text-gray-600 text-center">{image.caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal para imagen ampliada */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <OptimizedImage
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              options={{ ...options, quality: 95 }}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
