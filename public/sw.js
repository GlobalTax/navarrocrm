
const CACHE_NAME = 'crm-legal-v1'
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Cache de recursos estáticos
const CACHE_STRATEGIES = {
  static: {
    cacheName: `${CACHE_NAME}-static`,
    strategy: 'CacheFirst'
  },
  api: {
    cacheName: `${CACHE_NAME}-api`,
    strategy: 'NetworkFirst'
  },
  images: {
    cacheName: `${CACHE_NAME}-images`,
    strategy: 'CacheFirst'
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STRATEGIES.static.cacheName)
      .then((cache) => cache.addAll(STATIC_RESOURCES))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_STRATEGIES).some(s => s.cacheName === cacheName)) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache static assets
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirst(request, CACHE_STRATEGIES.static.cacheName))
  }
  // Cache images
  else if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, CACHE_STRATEGIES.images.cacheName))
  }
  // Network first for API calls
  else if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request, CACHE_STRATEGIES.api.cacheName))
  }
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.warn('Cache first failed:', error)
    return new Response('Network error', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    return new Response('Network error', { status: 503 })
  }
}
