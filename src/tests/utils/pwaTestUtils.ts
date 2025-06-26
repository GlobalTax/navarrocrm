
import { vi } from 'vitest'

// Utilidades para crear mocks de PWA en los tests
export const createPWAMockState = (overrides = {}) => ({
  isInstalled: false,
  isInstallable: true,
  isOnline: true,
  isUpdateAvailable: false,
  isUpdateReady: false,
  deferredPrompt: null,
  installPWA: vi.fn().mockResolvedValue(true),
  updatePWA: vi.fn(),
  syncData: vi.fn(),
  getDeviceInfo: vi.fn().mockReturnValue({
    platform: 'Web',
    language: 'es-ES',
    deviceMemory: 8,
    hardwareConcurrency: 4,
    maxTouchPoints: 0,
    isMobile: false
  }),
  getAppInfo: vi.fn().mockReturnValue({
    name: 'CRM Asesoría',
    version: '1.0.0',
    build: 'dev',
    environment: 'test',
    isPWA: true,
    isStandalone: false
  }),
  checkConnectivity: vi.fn().mockResolvedValue(true),
  clearCache: vi.fn().mockResolvedValue(true),
  getCacheStats: vi.fn().mockResolvedValue([]),
  requestBackgroundSync: vi.fn().mockResolvedValue(true),
  handleFileOpen: vi.fn(),
  handleProtocolAction: vi.fn(),
  ...overrides
})

// Utilidad para simular diferentes estados de PWA
export const PWAStates = {
  notInstalled: createPWAMockState({
    isInstalled: false,
    isInstallable: true
  }),
  
  installed: createPWAMockState({
    isInstalled: true,
    isInstallable: false,
    getAppInfo: vi.fn().mockReturnValue({
      name: 'CRM Asesoría',
      version: '1.0.0',
      isPWA: true,
      isStandalone: true
    })
  }),
  
  offline: createPWAMockState({
    isOnline: false,
    checkConnectivity: vi.fn().mockResolvedValue(false)
  }),
  
  updateAvailable: createPWAMockState({
    isInstalled: true,
    isUpdateAvailable: true
  }),
  
  updateReady: createPWAMockState({
    isInstalled: true,
    isUpdateReady: true
  }),
  
  mobile: createPWAMockState({
    getDeviceInfo: vi.fn().mockReturnValue({
      platform: 'Android',
      isMobile: true,
      maxTouchPoints: 5
    })
  })
}

// Utilidad para simular eventos de PWA
export const simulatePWAEvents = {
  beforeInstallPrompt: () => {
    const event = new Event('beforeinstallprompt')
    Object.defineProperty(event, 'prompt', {
      value: vi.fn()
    })
    Object.defineProperty(event, 'userChoice', {
      value: Promise.resolve({ outcome: 'accepted' })
    })
    window.dispatchEvent(event)
    return event
  },
  
  appInstalled: () => {
    const event = new Event('appinstalled')
    window.dispatchEvent(event)
    return event
  },
  
  online: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
    window.dispatchEvent(new Event('online'))
  },
  
  offline: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    window.dispatchEvent(new Event('offline'))
  }
}

// Mock de Service Worker con funcionalidades específicas
export const createServiceWorkerMock = () => ({
  register: vi.fn().mockResolvedValue({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    installing: null,
    waiting: {
      postMessage: vi.fn()
    },
    active: null,
    pushManager: {
      getSubscription: vi.fn().mockResolvedValue(null),
      subscribe: vi.fn().mockResolvedValue({})
    }
  }),
  ready: Promise.resolve({
    pushManager: {
      getSubscription: vi.fn().mockResolvedValue(null),
      subscribe: vi.fn().mockResolvedValue({})
    },
    sync: {
      register: vi.fn()
    }
  }),
  controller: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
})

// Mock de Cache API para testing
export const createCacheMock = () => ({
  put: vi.fn().mockResolvedValue(undefined),
  match: vi.fn().mockResolvedValue(null),
  keys: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(true),
  add: vi.fn().mockResolvedValue(undefined),
  addAll: vi.fn().mockResolvedValue(undefined),
})

// Utilidades para testing de conectividad
export const NetworkTestUtils = {
  simulateOnline: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
    window.dispatchEvent(new Event('online'))
  },
  
  simulateOffline: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    window.dispatchEvent(new Event('offline'))
  },
  
  mockSuccessfulFetch: () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true })
    })
  },
  
  mockFailedFetch: () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
  }
}

// Helpers para testing de notificaciones
export const NotificationTestUtils = {
  mockPermissionGranted: () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'granted',
      writable: true
    })
  },
  
  mockPermissionDenied: () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'denied',
      writable: true
    })
  },
  
  mockPermissionDefault: () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'default',
      writable: true
    })
  }
}
