// Service Worker para caché avanzado
const CACHE_NAME = 'crm-app-v1'
const RUNTIME_CACHE = 'crm-runtime-v1'

// Recursos para cachear inmediatamente
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Estrategias de caché
const CACHE_STRATEGIES = {
  // Cache First - para recursos estáticos
  cacheFirst: async (request: Request) => {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const response = await fetch(request)
    const cache = await caches.open(RUNTIME_CACHE)
    cache.put(request, response.clone())
    return response
  },

  // Network First - para datos dinámicos
  networkFirst: async (request: Request) => {
    try {
      const response = await fetch(request)
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
      return response
    } catch (error) {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      throw error
    }
  },

  // Stale While Revalidate - para recursos que pueden estar desactualizados
  staleWhileRevalidate: async (request: Request) => {
    const cache = await caches.open(RUNTIME_CACHE)
    const cachedResponse = await cache.match(request)
    
    const fetchPromise = fetch(request).then(response => {
      cache.put(request, response.clone())
      return response
    })

    return cachedResponse || fetchPromise
  }
}

// Install event
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo cachear requests GET
  if (request.method !== 'GET') {
    return
  }

  // Estrategia según el tipo de recurso
  if (url.pathname.startsWith('/api/')) {
    // API calls - Network First
    event.respondWith(CACHE_STRATEGIES.networkFirst(request))
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2)$/)) {
    // Recursos estáticos - Cache First
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request))
  } else if (url.pathname.startsWith('/')) {
    // Rutas de la app - Stale While Revalidate
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request))
  }
})

// Background sync para datos offline
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icon-view.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/icon-dismiss.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    )
  }
})

// Función para sincronizar datos offline
async function syncData() {
  try {
    // Sincronizar datos pendientes cuando vuelva la conexión
    const offlineData = await getOfflineData()
    
    for (const data of offlineData) {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    await clearOfflineData()
    console.log('✅ [SW] Data synced successfully')
  } catch (error) {
    console.error('❌ [SW] Sync failed:', error)
  }
}

// Funciones helper para manejo de datos offline
async function getOfflineData(): Promise<any[]> {
  // Implementar lógica para obtener datos offline
  return []
}

async function clearOfflineData(): Promise<void> {
  // Implementar lógica para limpiar datos offline
}