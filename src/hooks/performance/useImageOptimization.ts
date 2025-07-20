import { useState, useCallback, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'auto'
  progressive?: boolean
  enableLazyLoad?: boolean
}

interface OptimizedImage {
  url: string
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  format: string
  dimensions: { width: number; height: number }
}

export function useImageOptimization(options: ImageOptimizationOptions = {}) {
  const logger = useLogger('ImageOptimization')
  const {
    maxWidth = 1920,
    maxHeight = 1080, 
    quality = 0.8,
    format = 'auto',
    progressive = true,
    enableLazyLoad = true
  } = options

  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Check WebP support
  const supportsWebP = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }, [])

  // Optimize single image
  const optimizeImage = useCallback(async (
    file: File | string, 
    customOptions?: Partial<ImageOptimizationOptions>
  ): Promise<OptimizedImage> => {
    setIsProcessing(true)
    const startTime = performance.now()

    try {
      const opts = { ...options, ...customOptions }
      let img: HTMLImageElement

      // Load image
      if (typeof file === 'string') {
        img = await loadImageFromUrl(file)
      } else {
        img = await loadImageFromFile(file)
      }

      const originalDimensions = { width: img.width, height: img.height }
      
      // Calculate new dimensions
      const { width: newWidth, height: newHeight } = calculateOptimalSize(
        img.width, 
        img.height, 
        opts.maxWidth || maxWidth, 
        opts.maxHeight || maxHeight
      )

      // Create canvas for optimization
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas')
      }
      
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!
      
      canvas.width = newWidth
      canvas.height = newHeight

      // Apply progressive enhancement if supported
      if (opts.progressive && ctx.imageSmoothingEnabled !== undefined) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
      }

      // Draw optimized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      // Determine optimal format
      const outputFormat = determineOptimalFormat(opts.format || format, file)
      const mimeType = `image/${outputFormat}`

      // Convert to optimized blob
      const optimizedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          mimeType,
          outputFormat === 'jpeg' ? opts.quality || quality : undefined
        )
      })

      // Create optimized URL
      const optimizedUrl = URL.createObjectURL(optimizedBlob)
      
      // Calculate metrics
      const originalSize = typeof file === 'string' ? 0 : file.size
      const optimizedSize = optimizedBlob.size
      const compressionRatio = originalSize > 0 ? 
        ((originalSize - optimizedSize) / originalSize) * 100 : 0

      const processingTime = performance.now() - startTime

      logger.info('🖼️ Imagen optimizada', {
        originalSize: `${(originalSize / 1024).toFixed(1)}KB`,
        optimizedSize: `${(optimizedSize / 1024).toFixed(1)}KB`,
        compressionRatio: `${compressionRatio.toFixed(1)}%`,
        format: outputFormat,
        dimensions: `${newWidth}x${newHeight}`,
        processingTime: `${processingTime.toFixed(2)}ms`
      })

      return {
        url: optimizedUrl,
        originalSize,
        optimizedSize,
        compressionRatio,
        format: outputFormat,
        dimensions: { width: newWidth, height: newHeight }
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de optimización'
      logger.error('❌ Error optimizando imagen', { error: errorMsg })
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [options, maxWidth, maxHeight, quality, format, logger])

  // Batch optimization
  const optimizeImages = useCallback(async (
    files: (File | string)[],
    customOptions?: Partial<ImageOptimizationOptions>
  ): Promise<OptimizedImage[]> => {
    const results: OptimizedImage[] = []
    
    for (const file of files) {
      try {
        const optimized = await optimizeImage(file, customOptions)
        results.push(optimized)
      } catch (error) {
        logger.error('❌ Error en imagen del lote', { 
          file: typeof file === 'string' ? file : file.name 
        })
      }
    }

    logger.info('📦 Lote de imágenes procesado', {
      total: files.length,
      successful: results.length,
      failed: files.length - results.length
    })

    return results
  }, [optimizeImage, logger])

  // Helper functions
  const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Error cargando imagen'))
      }
      
      img.src = url
    })
  }

  const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Error cargando imagen desde URL'))
      
      img.src = url
    })
  }

  const calculateOptimalSize = (
    originalWidth: number,
    originalHeight: number,
    maxW: number,
    maxH: number
  ) => {
    let { width, height } = { width: originalWidth, height: originalHeight }
    
    // Scale down if larger than max dimensions
    if (width > maxW || height > maxH) {
      const ratio = Math.min(maxW / width, maxH / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }
    
    return { width, height }
  }

  const determineOptimalFormat = (
    preferredFormat: string,
    file: File | string
  ): 'webp' | 'jpeg' | 'png' => {
    if (preferredFormat === 'auto') {
      // Use WebP if supported, otherwise use JPEG for photos, PNG for graphics
      if (supportsWebP()) return 'webp'
      
      const isPhoto = typeof file === 'string' ? 
        file.includes('.jpg') || file.includes('.jpeg') :
        file.type.includes('jpeg')
      
      return isPhoto ? 'jpeg' : 'png'
    }
    
    return preferredFormat as 'webp' | 'jpeg' | 'png'
  }

  return {
    optimizeImage,
    optimizeImages,
    isProcessing,
    supportsWebP: supportsWebP()
  }
}