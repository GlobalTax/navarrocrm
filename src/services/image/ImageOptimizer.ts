import { ENV_CONFIG } from '@/config/environment'

interface ImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  lazy?: boolean
  placeholder?: string
  blur?: number
  responsive?: boolean
  sizes?: string
}

interface OptimizedImageResult {
  url: string
  srcSet?: string
  placeholder?: string
  aspectRatio: number
}

// Clase singleton para optimización de imágenes
export class ImageOptimizer {
  private static instance: ImageOptimizer
  private imageCache = new Map<string, string>()
  private observer: IntersectionObserver | null = null
  private supportsWebP: boolean | null = null
  private supportsAVIF: boolean | null = null

  private constructor() {
    this.detectFormatSupport()
    if (ENV_CONFIG.development.debug) {
      console.log('🖼️ [Images] Optimizador inicializado con configuración:', {
        cloudinary: !!ENV_CONFIG.images.cloudinaryUrl,
        quality: ENV_CONFIG.images.defaultQuality,
        webp: ENV_CONFIG.images.enableWebP,
        avif: ENV_CONFIG.images.enableAVIF
      })
    }
  }

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer()
    }
    return ImageOptimizer.instance
  }

  // Detectar soporte de formatos modernos
  private async detectFormatSupport(): Promise<void> {
    if (!ENV_CONFIG.images.enableOptimization) return

    // Detectar WebP
    if (ENV_CONFIG.images.enableWebP) {
      const webpCanvas = document.createElement('canvas')
      webpCanvas.width = 1
      webpCanvas.height = 1
      this.supportsWebP = webpCanvas.toDataURL('image/webp').indexOf('image/webp') === 5
    }

    // Detectar AVIF
    if (ENV_CONFIG.images.enableAVIF) {
      this.supportsAVIF = await this.testAVIFSupport()
    }

    if (ENV_CONFIG.development.enableLogs) {
      console.log('🖼️ [Images] Soporte de formatos detectado:', {
        webp: this.supportsWebP,
        avif: this.supportsAVIF
      })
    }
  }

  private testAVIFSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    })
  }

  // Obtener mejor formato soportado
  private getBestFormat(preferredFormat?: string): string {
    if (!ENV_CONFIG.images.enableOptimization) return 'jpeg'
    
    if (preferredFormat === 'avif' && this.supportsAVIF && ENV_CONFIG.images.enableAVIF) return 'avif'
    if (preferredFormat === 'webp' && this.supportsWebP && ENV_CONFIG.images.enableWebP) return 'webp'
    if (this.supportsAVIF && ENV_CONFIG.images.enableAVIF) return 'avif'
    if (this.supportsWebP && ENV_CONFIG.images.enableWebP) return 'webp'
    return 'jpeg'
  }

  // Generar URL optimizada
  async generateOptimizedUrl(
    originalUrl: string,
    options: ImageOptions = {}
  ): Promise<string> {
    const cacheKey = `${originalUrl}-${JSON.stringify(options)}`
    
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!
    }

    let optimizedUrl = originalUrl

    // Para URLs externas, usar servicio de optimización si está configurado
    if (this.isExternalUrl(originalUrl) && ENV_CONFIG.images.cloudinaryUrl) {
      optimizedUrl = this.buildCloudinaryUrl(originalUrl, options)
    } else if (!this.isExternalUrl(originalUrl)) {
      // Para imágenes locales, usar optimización básica
      optimizedUrl = await this.optimizeLocalImage(originalUrl, options)
    }

    this.imageCache.set(cacheKey, optimizedUrl)
    return optimizedUrl
  }

  private isExternalUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://')
  }

  private buildCloudinaryUrl(url: string, options: ImageOptions): string {
    if (!ENV_CONFIG.images.cloudinaryUrl) return url

    const params: string[] = []
    
    if (options.width) params.push(`w_${options.width}`)
    if (options.height) params.push(`h_${options.height}`)
    
    const quality = options.quality || ENV_CONFIG.images.defaultQuality
    params.push(`q_${quality}`)
    
    const format = this.getBestFormat(options.format)
    params.push(`f_${format}`)
    
    if (options.blur) params.push(`e_blur:${options.blur}`)

    // Construir URL de Cloudinary
    const baseUrl = ENV_CONFIG.images.cloudinaryUrl.replace(/\/$/, '')
    const transformations = params.join(',')
    
    // Para Cloudinary, usar fetch para URLs externas
    return `${baseUrl}/image/fetch/${transformations}/${encodeURIComponent(url)}`
  }

  private async optimizeLocalImage(url: string, options: ImageOptions): Promise<string> {
    if (!ENV_CONFIG.images.enableOptimization) return url

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        const { width, height, blur } = options
        const quality = options.quality || ENV_CONFIG.images.defaultQuality
        
        canvas.width = width || img.naturalWidth
        canvas.height = height || img.naturalHeight
        
        if (blur) {
          ctx.filter = `blur(${blur}px)`
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        const format = this.getBestFormat(options.format)
        const mimeType = this.getMimeType(format)
        const optimizedUrl = canvas.toDataURL(mimeType, quality / 100)
        
        resolve(optimizedUrl)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = url
    })
  }

  private getMimeType(format: string): string {
    const mimeTypes: { [key: string]: string } = {
      'webp': 'image/webp',
      'avif': 'image/avif',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    }
    return mimeTypes[format] || 'image/jpeg'
  }

  // Generar srcSet responsive
  async generateSrcSet(
    baseUrl: string,
    widths: number[] = [320, 640, 768, 1024, 1280, 1920],
    options: ImageOptions = {}
  ): Promise<string> {
    const srcSetPromises = widths.map(async (width) => {
      const optimizedUrl = await this.generateOptimizedUrl(baseUrl, { ...options, width })
      return `${optimizedUrl} ${width}w`
    })

    const srcSetArray = await Promise.all(srcSetPromises)
    return srcSetArray.join(', ')
  }

  // Generar placeholder blur
  async generatePlaceholder(url: string): Promise<string> {
    return this.generateOptimizedUrl(url, {
      width: 20,
      quality: 10,
      blur: 10
    })
  }

  // Setup lazy loading con Intersection Observer
  setupLazyLoading(
    element: HTMLElement,
    callback: () => void,
    rootMargin: string = '50px'
  ): () => void {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement
              const callbackFn = (target as any).__lazyCallback
              if (callbackFn) {
                callbackFn()
                this.observer?.unobserve(entry.target)
                delete (target as any).__lazyCallback
              }
            }
          })
        },
        { rootMargin }
      )
    }

    // Almacenar callback en el elemento
    ;(element as any).__lazyCallback = callback
    this.observer.observe(element)

    // Retornar función de cleanup
    return () => {
      if (this.observer && element) {
        this.observer.unobserve(element)
        delete (element as any).__lazyCallback
      }
    }
  }

  // Limpiar cache
  clearCache(): void {
    this.imageCache.clear()
  }

  // Obtener estadísticas del cache
  getCacheStats() {
    return {
      size: this.imageCache.size,
      entries: Array.from(this.imageCache.keys()),
      cloudinaryEnabled: !!ENV_CONFIG.images.cloudinaryUrl,
      optimizationEnabled: ENV_CONFIG.images.enableOptimization
    }
  }
}

export type { ImageOptions, OptimizedImageResult }
