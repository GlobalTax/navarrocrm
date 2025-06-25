
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
    sampleRate: 1.0
  }
} as const

export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD
export const currentConfig = isDevelopment ? ENV_CONFIG.development : ENV_CONFIG.production
