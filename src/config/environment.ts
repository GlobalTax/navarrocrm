
// Configuración centralizada de variables de entorno
export const ENV_CONFIG = {
  // Analytics
  analytics: {
    endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics',
    flushInterval: Number(import.meta.env.VITE_ANALYTICS_FLUSH_INTERVAL) || 5000,
    batchSize: Number(import.meta.env.VITE_ANALYTICS_BATCH_SIZE) || 10,
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED !== 'false'
  },

  // Cache
  cache: {
    ttl: Number(import.meta.env.VITE_CACHE_TTL) || 5 * 60 * 1000, // 5 minutos por defecto
    maxSize: Number(import.meta.env.VITE_CACHE_MAX_SIZE) || 100, // 100MB por defecto
    maxItems: Number(import.meta.env.VITE_CACHE_MAX_ITEMS) || 1000,
    strategy: (import.meta.env.VITE_CACHE_STRATEGY as 'LRU' | 'LFU' | 'FIFO') || 'LRU'
  },

  // Imágenes
  images: {
    cloudinaryUrl: import.meta.env.VITE_CLOUDINARY_URL || '',
    enableOptimization: import.meta.env.VITE_IMAGES_OPTIMIZATION !== 'false',
    defaultQuality: Number(import.meta.env.VITE_IMAGES_QUALITY) || 80,
    enableWebP: import.meta.env.VITE_IMAGES_WEBP !== 'false',
    enableAVIF: import.meta.env.VITE_IMAGES_AVIF !== 'false'
  },

  // Base de datos
  database: {
    slowQueryThreshold: Number(import.meta.env.VITE_DB_SLOW_QUERY_THRESHOLD) || 1000,
    cacheEnabled: import.meta.env.VITE_DB_CACHE_ENABLED !== 'false',
    defaultPageSize: Number(import.meta.env.VITE_DB_DEFAULT_PAGE_SIZE) || 20
  },

  // Desarrollo
  development: {
    debug: import.meta.env.MODE === 'development',
    enableLogs: import.meta.env.VITE_ENABLE_LOGS !== 'false'
  }
}

// Validación de configuración
export const validateEnvironment = () => {
  const warnings: string[] = []
  const errors: string[] = []

  // Validar URLs
  if (ENV_CONFIG.images.cloudinaryUrl && !isValidUrl(ENV_CONFIG.images.cloudinaryUrl)) {
    warnings.push('VITE_CLOUDINARY_URL parece no ser una URL válida')
  }

  if (ENV_CONFIG.analytics.endpoint && !isValidEndpoint(ENV_CONFIG.analytics.endpoint)) {
    warnings.push('VITE_ANALYTICS_ENDPOINT parece no ser un endpoint válido')
  }

  // Validar números
  if (ENV_CONFIG.cache.ttl < 1000) {
    warnings.push('VITE_CACHE_TTL es muy bajo (< 1s), puede afectar performance')
  }

  if (ENV_CONFIG.cache.maxSize < 10) {
    warnings.push('VITE_CACHE_MAX_SIZE es muy bajo (< 10MB), puede afectar performance')
  }

  // Log resultados
  if (warnings.length > 0) {
    console.warn('⚠️ [ENV] Advertencias de configuración:', warnings)
  }

  if (errors.length > 0) {
    console.error('❌ [ENV] Errores de configuración:', errors)
    throw new Error(`Configuración inválida: ${errors.join(', ')}`)
  }

  if (ENV_CONFIG.development.debug) {
    console.log('🔧 [ENV] Configuración cargada:', ENV_CONFIG)
  }
}

// Utilidades de validación
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

function isValidEndpoint(endpoint: string): boolean {
  return endpoint.startsWith('/') || isValidUrl(endpoint)
}

// Inicializar validación
if (typeof window !== 'undefined') {
  validateEnvironment()
}
