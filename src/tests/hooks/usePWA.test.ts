
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePWA } from '@/hooks/usePWA'

// Mock de todos los hooks internos
vi.mock('@/hooks/pwa/usePWAState', () => ({
  usePWAState: vi.fn()
}))

vi.mock('@/hooks/pwa/useServiceWorker', () => ({
  useServiceWorker: vi.fn()
}))

vi.mock('@/hooks/pwa/useInstallPrompt', () => ({
  useInstallPrompt: vi.fn()
}))

vi.mock('@/hooks/pwa/usePWAActions', () => ({
  usePWAActions: vi.fn()
}))

vi.mock('@/hooks/pwa/useCacheManagement', () => ({
  useCacheManagement: vi.fn()
}))

vi.mock('@/hooks/pwa/useDeviceInfo', () => ({
  useDeviceInfo: vi.fn()
}))

vi.mock('@/hooks/pwa/usePWAFileHandlers', () => ({
  usePWAFileHandlers: vi.fn()
}))

describe('usePWA', () => {
  const mockSetPwaState = vi.fn()
  const mockRegistrationRef = { current: null }
  const mockDeferredPromptRef = { current: null }

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Mock de usePWAState
    const { usePWAState } = await import('@/hooks/pwa/usePWAState')
    vi.mocked(usePWAState).mockReturnValue({
      pwaState: {
        isInstalled: false,
        isInstallable: true,
        isOnline: true,
        isUpdateAvailable: false,
        isUpdateReady: false,
        deferredPrompt: null
      },
      setPwaState: mockSetPwaState
    })

    // Mock de useServiceWorker
    const { useServiceWorker } = await import('@/hooks/pwa/useServiceWorker')
    vi.mocked(useServiceWorker).mockReturnValue(mockRegistrationRef)

    // Mock de useInstallPrompt
    const { useInstallPrompt } = await import('@/hooks/pwa/useInstallPrompt')
    vi.mocked(useInstallPrompt).mockReturnValue(mockDeferredPromptRef)

    // Mock de usePWAActions
    const { usePWAActions } = await import('@/hooks/pwa/usePWAActions')
    vi.mocked(usePWAActions).mockReturnValue({
      installPWA: vi.fn().mockResolvedValue(true),
      updatePWA: vi.fn(),
      checkConnectivity: vi.fn().mockResolvedValue(true),
      syncData: vi.fn(),
      requestBackgroundSync: vi.fn().mockResolvedValue(true)
    })

    // Mock de useCacheManagement
    const { useCacheManagement } = await import('@/hooks/pwa/useCacheManagement')
    vi.mocked(useCacheManagement).mockReturnValue({
      clearCache: vi.fn().mockResolvedValue(true),
      getCacheStats: vi.fn().mockResolvedValue([])
    })

    // Mock de useDeviceInfo
    const { useDeviceInfo } = await import('@/hooks/pwa/useDeviceInfo')
    vi.mocked(useDeviceInfo).mockReturnValue({
      getDeviceInfo: vi.fn().mockReturnValue({
        platform: 'Web',
        isMobile: false
      }),
      getAppInfo: vi.fn().mockReturnValue({
        name: 'CRM Asesoría',
        version: '1.0.0'
      })
    })

    // Mock de usePWAFileHandlers
    const { usePWAFileHandlers } = await import('@/hooks/pwa/usePWAFileHandlers')
    vi.mocked(usePWAFileHandlers).mockReturnValue({
      handleFileOpen: vi.fn(),
      handleProtocolAction: vi.fn()
    })
  })

  it('debe retornar el estado inicial correcto', () => {
    const { result } = renderHook(() => usePWA())

    expect(result.current.isInstalled).toBe(false)
    expect(result.current.isInstallable).toBe(true)
    expect(result.current.isOnline).toBe(true)
    expect(result.current.isUpdateAvailable).toBe(false)
    expect(result.current.isUpdateReady).toBe(false)
  })

  it('debe proporcionar funciones de acción', () => {
    const { result } = renderHook(() => usePWA())

    expect(typeof result.current.installPWA).toBe('function')
    expect(typeof result.current.updatePWA).toBe('function')
    expect(typeof result.current.syncData).toBe('function')
    expect(typeof result.current.clearCache).toBe('function')
    expect(typeof result.current.getCacheStats).toBe('function')
  })

  it('debe proporcionar funciones de información', () => {
    const { result } = renderHook(() => usePWA())

    expect(typeof result.current.getDeviceInfo).toBe('function')
    expect(typeof result.current.getAppInfo).toBe('function')
  })

  it('debe proporcionar funciones legacy para compatibilidad', () => {
    const { result } = renderHook(() => usePWA())

    expect(result.current.installApp).toBe(result.current.installPWA)
    expect(result.current.isInstallable).toBe(true)
    expect(result.current.isInstalled).toBe(false)
    expect(result.current.isOnline).toBe(true)
  })

  it('debe llamar a installPWA correctamente', async () => {
    const { result } = renderHook(() => usePWA())

    await act(async () => {
      const success = await result.current.installPWA()
      expect(success).toBe(true)
    })
  })

  it('debe llamar a checkConnectivity correctamente', async () => {
    const { result } = renderHook(() => usePWA())

    await act(async () => {
      const isConnected = await result.current.checkConnectivity()
      expect(isConnected).toBe(true)
    })
  })
})
