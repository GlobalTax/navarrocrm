const CACHE_NAME = 'crm-asesoria-v2.0.0'
const STATIC_CACHE = 'crm-static-v2.0.0'
const DYNAMIC_CACHE = 'crm-dynamic-v2.0.0'

// Archivos críticos para offline
const CRITICAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Rutas críticas del CRM
const CRITICAL_ROUTES = [
  '/dashboard',
  '/contacts',
  '/cases',
  '/proposals',
  '/tasks'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 [SW] Instalando Service Worker v2.0.0...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 [SW] Cacheando archivos críticos...')
        return cache.addAll(CRITICAL_FILES)
      })
      .then(() => {
        console.log('✅ [SW] Service Worker instalado correctamente')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ [SW] Error durante la instalación:', error)
      })
  )
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 [SW] Activando Service Worker v2.0.0...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ [SW] Eliminando cache obsoleto:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ [SW] Service Worker activado')
        return self.clients.claim()
      })
  )
})

// Estrategia de cache inteligente
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requests de analytics y otros servicios externos
  if (url.hostname !== self.location.hostname && !url.hostname.includes('supabase')) {
    return
  }

  // Estrategia para rutas críticas del CRM
  if (CRITICAL_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(handleCriticalRoute(request))
    return
  }

  // Estrategia para API de Supabase
  if (url.hostname.includes('supabase')) {
    event.respondWith(handleSupabaseRequest(request))
    return
  }

  // Estrategia para archivos estáticos
  if (isStaticFile(request)) {
    event.respondWith(handleStaticFile(request))
    return
  }

  // Estrategia por defecto
  event.respondWith(handleDefaultRequest(request))
})

// Manejar rutas críticas del CRM
async function handleCriticalRoute(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 [SW] Red no disponible para ruta crítica, usando cache...')
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    return createCRMOfflineResponse(request)
  }
}

// Manejar requests de Supabase - CORREGIDO: Solo cachear GET requests
async function handleSupabaseRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Solo cachear requests GET exitosos
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 [SW] Supabase offline, usando cache...')
    
    // Solo buscar en cache para requests GET
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    return new Response(JSON.stringify({ 
      error: 'offline', 
      message: 'Datos no disponibles sin conexión' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Detectar requests especiales de PWA
function isPWAHandlerRequest(request) {
  const url = new URL(request.url)
  return url.pathname === '/share' || url.pathname === '/upload'
}

// Manejar requests especiales de PWA
async function handlePWARequest(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    // Fallback para handlers PWA cuando están offline
    const url = new URL(request.url)
    
    if (url.pathname === '/share') {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Compartir - CRM Asesoría</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 20px; background: #f5f5f5;
                display: flex; align-items: center; justify-content: center;
                min-height: 100vh;
              }
              .pwa-container {
                text-align: center; background: white; padding: 40px;
                border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              .pwa-icon { font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; line-height: 1.6; }
              .retry-btn {
                background: #0061FF; color: white; border: none;
                padding: 12px 24px; border-radius: 6px; cursor: pointer;
                margin-top: 20px; font-size: 16px;
              }
            </style>
          </head>
          <body>
            <div class="pwa-container">
              <div class="pwa-icon">📤</div>
              <h1>Función de Compartir</h1>
              <p>Esta función requiere conexión a internet.</p>
              <p>Los archivos se procesarán cuando recuperes la conexión.</p>
              <button class="retry-btn" onclick="window.location.reload()">
                Reintentar
              </button>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    if (url.pathname === '/upload') {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Subir Archivos - CRM Asesoría</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 20px; background: #f5f5f5;
                display: flex; align-items: center; justify-content: center;
                min-height: 100vh;
              }
              .pwa-container {
                text-align: center; background: white; padding: 40px;
                border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              .pwa-icon { font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; line-height: 1.6; }
              .retry-btn {
                background: #0061FF; color: white; border: none;
                padding: 12px 24px; border-radius: 6px; cursor: pointer;
                margin-top: 20px; font-size: 16px;
              }
            </style>
          </head>
          <body>
            <div class="pwa-container">
              <div class="pwa-icon">📁</div>
              <h1>Subir Archivos</h1>
              <p>Esta función requiere conexión a internet.</p>
              <p>Los archivos se subirán cuando recuperes la conexión.</p>
              <button class="retry-btn" onclick="window.location.reload()">
                Reintentar
              </button>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    return createOfflineResponse(request)
  }
}

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requests de analytics y otros servicios externos
  if (url.hostname !== self.location.hostname) {
    return
  }

  // Estrategia para PWA handlers
  if (isPWAHandlerRequest(request)) {
    event.respondWith(handlePWARequest(request))
    return
  }

  // Estrategia para archivos estáticos
  if (isStaticFile(request)) {
    event.respondWith(handleStaticFile(request))
    return
  }

  // Estrategia para API calls
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Estrategia por defecto
  event.respondWith(handleDefaultRequest(request))
})

// Detectar archivos estáticos
function isStaticFile(request) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2']
  const url = new URL(request.url)
  return staticExtensions.some(ext => url.pathname.endsWith(ext))
}

// Detectar requests de API
function isApiRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/') || url.hostname.includes('supabase')
}

// Manejar archivos estáticos (Cache First)
async function handleStaticFile(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ [SW] Error en archivo estático:', error)
    return new Response('Error de red', { status: 503 })
  }
}

// Manejar requests de API (Network First)
async function handleApiRequest(request) {
  try {
    // Intentar red primero
    const networkResponse = await fetch(request)
    
    // Solo cachear requests GET exitosos
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 [SW] Red no disponible, usando cache...')
    
    // Solo buscar en cache para requests GET
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    // Respuesta offline personalizada
    return createOfflineResponse(request)
  }
}

// Manejar requests por defecto
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    return createOfflineResponse(request)
  }
}

// Crear respuesta offline personalizada
function createOfflineResponse(request) {
  const url = new URL(request.url)
  
  if (url.pathname === '/') {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CRM Asesoría - Modo Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; padding: 20px; background: #f5f5f5;
              display: flex; align-items: center; justify-content: center;
              min-height: 100vh;
            }
            .offline-container {
              text-align: center; background: white; padding: 40px;
              border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .offline-icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; line-height: 1.6; }
            .retry-btn {
              background: #007bff; color: white; border: none;
              padding: 12px 24px; border-radius: 6px; cursor: pointer;
              margin-top: 20px; font-size: 16px;
            }
            .retry-btn:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>Modo Offline</h1>
            <p>No tienes conexión a internet. Algunas funciones pueden no estar disponibles.</p>
            <p>Los datos se sincronizarán automáticamente cuando recuperes la conexión.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Reintentar
            </button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
  
  return new Response('Contenido no disponible offline', { status: 503 })
}

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Sincronización en segundo plano:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync())
  }
})

// Realizar sincronización en segundo plano
async function performBackgroundSync() {
  try {
    console.log('🔄 [SW] Iniciando sincronización en segundo plano...')
    
    // Aquí implementarías la lógica de sincronización
    // Por ejemplo, enviar datos pendientes al servidor
    
    console.log('✅ [SW] Sincronización completada')
  } catch (error) {
    console.error('❌ [SW] Error en sincronización:', error)
  }
}

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('📱 [SW] Notificación push recibida')
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/icon-192x192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('CRM Asesoría', options)
  )
})

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [SW] Notificación clickeada:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('💬 [SW] Mensaje recibido:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    )
  }
})

// Crear respuesta offline específica para CRM
function createCRMOfflineResponse(request) {
  const url = new URL(request.url)
  
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CRM Asesoría - Modo Offline</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f8fafc;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; color: #334155;
          }
          .offline-container {
            text-align: center; background: white; padding: 40px;
            border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 400px; border: 1px solid #e2e8f0;
          }
          .offline-icon { font-size: 48px; margin-bottom: 20px; }
          h1 { color: #0f172a; margin-bottom: 10px; font-size: 24px; }
          p { color: #64748b; line-height: 1.6; margin-bottom: 16px; }
          .retry-btn {
            background: #0061FF; color: white; border: none;
            padding: 12px 24px; border-radius: 8px; cursor: pointer;
            margin-top: 20px; font-size: 16px; font-weight: 500;
            transition: background-color 0.2s;
          }
          .retry-btn:hover { background: #0056e0; }
          .features {
            background: #f1f5f9; padding: 16px; border-radius: 8px;
            margin-top: 20px; text-align: left;
          }
          .features h3 { margin: 0 0 8px 0; font-size: 14px; color: #475569; }
          .features ul { margin: 0; padding-left: 16px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">⚡</div>
          <h1>CRM en Modo Offline</h1>
          <p>No hay conexión a internet. Algunas funciones están limitadas.</p>
          
          <div class="features">
            <h3>Disponible sin conexión:</h3>
            <ul>
              <li>Consultar datos previamente cargados</li>
              <li>Crear borradores de documentos</li>
              <li>Navegar por la aplicación</li>
            </ul>
          </div>
          
          <p>Los cambios se sincronizarán automáticamente cuando recuperes la conexión.</p>
          
          <button class="retry-btn" onclick="window.location.reload()">
            Reintentar Conexión
          </button>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}
