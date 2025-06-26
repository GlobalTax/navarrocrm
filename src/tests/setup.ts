
import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock de matchMedia mejorado
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de Service Worker mejorado
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      installing: null,
      waiting: null,
      active: null,
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue({}),
      },
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    ready: Promise.resolve({
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue({}),
      },
      sync: {
        register: vi.fn(),
      },
    }),
    controller: null,
  },
})

// Mock de localStorage y sessionStorage mejorados
const createStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
}

Object.defineProperty(window, 'localStorage', { value: createStorageMock() })
Object.defineProperty(window, 'sessionStorage', { value: createStorageMock() })

// Mock de caches API mejorado
Object.defineProperty(window, 'caches', {
  writable: true,
  value: {
    open: vi.fn().mockResolvedValue({
      put: vi.fn(),
      match: vi.fn().mockResolvedValue(null),
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(true),
      add: vi.fn(),
      addAll: vi.fn(),
    }),
    keys: vi.fn().mockResolvedValue(['cache-1', 'cache-2']),
    delete: vi.fn().mockResolvedValue(true),
    has: vi.fn().mockResolvedValue(true),
  },
})

// Mock de Notification API mejorado
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    permission: 'default',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  },
})

// Mock de PushManager
Object.defineProperty(window, 'PushManager', {
  writable: true,
  value: {
    supportedContentEncodings: ['aes128gcm'],
  },
})

// Mock completo de fetch con Response mejorado
const createMockResponse = (data: any, status = 200, statusText = 'OK') => ({
  ok: status >= 200 && status < 300,
  status,
  statusText,
  headers: new Headers(),
  url: '',
  redirected: false,
  type: 'default' as ResponseType,
  body: null,
  bodyUsed: false,
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  blob: vi.fn().mockResolvedValue(new Blob()),
  formData: vi.fn().mockResolvedValue(new FormData()),
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  clone: vi.fn().mockReturnThis(),
})

global.fetch = vi.fn()

// Mock de ResizeObserver mejorado
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Configuración global para cada test
beforeEach(() => {
  // Limpiar DOM
  cleanup()
  
  // Limpiar todos los mocks
  vi.clearAllMocks()
  
  // Reset fetch mock con respuesta por defecto
  vi.mocked(fetch).mockResolvedValue(createMockResponse({}))
  
  // Limpiar storage mocks
  window.localStorage.clear()
  window.sessionStorage.clear()
  
  // Mock de console específico para evitar spam en tests
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  // Mantener console.error visible para debugging
  vi.spyOn(console, 'error').mockImplementation((message) => {
    if (process.env.NODE_ENV !== 'test' || message.includes('Test Error')) {
      console.error(message)
    }
  })
})

afterEach(() => {
  // Restaurar todos los mocks después de cada test
  vi.restoreAllMocks()
})

// Helper para configurar fetch mock fácilmente
export const mockFetch = (data: any, status = 200) => {
  vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(data, status))
}

// Helper para simular errores de fetch
export const mockFetchError = (error: string) => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error(error))
}
