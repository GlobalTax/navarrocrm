
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
