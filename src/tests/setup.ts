
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de matchMedia
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

// Mock de Service Worker
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

// Mock de localStorage y sessionStorage
const createStorageMock = () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
})

Object.defineProperty(window, 'localStorage', { value: createStorageMock() })
Object.defineProperty(window, 'sessionStorage', { value: createStorageMock() })

// Mock de caches API
Object.defineProperty(window, 'caches', {
  writable: true,
  value: {
    open: vi.fn().mockResolvedValue({
      put: vi.fn(),
      match: vi.fn(),
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn(),
    }),
    keys: vi.fn().mockResolvedValue(['cache-1', 'cache-2']),
    delete: vi.fn().mockResolvedValue(true),
  },
})

// Mock de Notification API
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

// Mock de fetch
global.fetch = vi.fn()

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Configuración global para cada test
beforeEach(() => {
  vi.clearAllMocks()
  
  // Reset fetch mock
  vi.mocked(fetch).mockReset()
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({}),
    text: vi.fn().mockResolvedValue(''),
  } as Response)
})
