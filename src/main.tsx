
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ENV_CONFIG } from './config/environment'
import { AppProvider } from '@/contexts/AppContext'

// Registrar Service Worker mejorado
if ('serviceWorker' in navigator && ENV_CONFIG.pwa.enableOffline) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      if (ENV_CONFIG.development.enableLogs) {
        console.log('✅ [PWA] Service Worker registrado:', registration.scope)
      }
      
      // Escuchar actualizaciones del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 [PWA] Nueva versión disponible')
              
              // Mostrar notificación de actualización disponible
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('CRM Asesoría', {
                  body: 'Nueva versión disponible. Haz clic para actualizar.',
                  icon: '/icons/icon-192x192.png',
                  tag: 'update-available'
                })
              }
            }
          })
        }
      })

      // Manejar errores del Service Worker
      registration.addEventListener('error', (error) => {
        console.error('❌ [PWA] Error en Service Worker:', error)
      })

    } catch (error) {
      console.error('❌ [PWA] Error al registrar Service Worker:', error)
    }
  })
}

// Solicitar permisos de notificación si están habilitadas
if ('Notification' in window && ENV_CONFIG.pwa.enableNotifications) {
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (ENV_CONFIG.development.enableLogs) {
        console.log('🔔 [PWA] Permisos de notificación:', permission)
      }
    })
  }
}

// Detectar instalación de la PWA
window.addEventListener('appinstalled', () => {
  if (ENV_CONFIG.development.enableLogs) {
    console.log('📱 [PWA] Aplicación instalada correctamente')
  }
})

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
