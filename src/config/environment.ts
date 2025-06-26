
// Configuración de entorno centralizada para el CRM
export const ENV_CONFIG = {
  development: {
    debug: true,
    enableLogs: true,
    mockData: false
  },
  production: {
    debug: false,
    enableLogs: false,
    mockData: false
  },
  pwa: {
    enableOffline: true,
    enableNotifications: true,
    enableBackgroundSync: true,
    cacheStrategy: 'NetworkFirst' as const
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 50, // MB
    maxItems: 1000,
    strategy: 'LRU' as const
  },
  analytics: {
    enableTracking: true,
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    sampleRate: 1.0,
    enabled: true,
    batchSize: 10,
    flushInterval: 30000, // 30 segundos
    endpoint: '/api/analytics'
  },
  database: {
    slowQueryThreshold: 1000, // 1 segundo
    cacheEnabled: true,
    defaultPageSize: 20
  },
  images: {
    cloudinaryUrl: import.meta.env.VITE_CLOUDINARY_URL as string | undefined,
    enableOptimization: true,
    enableWebP: true,
    enableAVIF: true,
    defaultQuality: 80
  }
} as const

export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD
export const currentConfig = isDevelopment ? ENV_CONFIG.development : ENV_CONFIG.production
