// Service Worker v4 for CRM Application - Pure JS
const CACHE_NAME = 'crm-cache-v4'
const RUNTIME_CACHE = 'crm-runtime-v4'

// Only cache routes that definitely exist
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/contacts', 
  '/cases'
]

// Simplified cache strategies in pure JS
const cacheFirst = async (request) => {
  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.warn('Cache first failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cache = await caches.open(RUNTIME_CACHE)
    const cachedResponse = await cache.match(request)
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('SW install failed:', error)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map(cacheName => caches.delete(cacheName))
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const request = event.request
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  const url = new URL(request.url)
  
  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return
  }
  
  // Simple strategy: cache first for all requests
  event.respondWith(cacheFirst(request))
})

// Background sync para datos offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
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
        title: 'Ver'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
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
    console.log('✅ [SW] Data sync started')
  } catch (error) {
    console.error('❌ [SW] Sync failed:', error)
  }
}