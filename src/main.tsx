
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('✅ [PWA] Service Worker registrado:', registration.scope)
      
      // Escuchar actualizaciones del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 [PWA] Nueva versión disponible')
              // Aquí podrías mostrar una notificación al usuario
              if (confirm('Nueva versión disponible. ¿Recargar la página?')) {
                window.location.reload()
              }
            }
          })
        }
      })
    } catch (error) {
      console.error('❌ [PWA] Error al registrar Service Worker:', error)
    }
  })
}

createRoot(document.getElementById("root")!).render(<App />);
