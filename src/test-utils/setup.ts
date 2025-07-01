
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Establecer handlers de MSW antes de todas las pruebas
beforeAll(() => server.listen())

// Resetear handlers después de cada prueba
afterEach(() => server.resetHandlers())

// Limpiar después de las pruebas
afterAll(() => server.close())

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock para ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
