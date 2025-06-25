
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PWAInfoPanel } from '@/components/pwa/PWAInfoPanel'

// Mock del hook usePWA
vi.mock('@/hooks/usePWA', () => ({
  usePWA: vi.fn()
}))

const mockUsePWA = vi.mocked(await import('@/hooks/usePWA')).usePWA

describe('PWAInfoPanel', () => {
  const defaultMockState = {
    isInstalled: true,
    isOnline: true,
    isInstallable: false,
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
      environment: 'development',
      isPWA: true,
      isStandalone: true
    }),
    clearCache: vi.fn().mockResolvedValue(true),
    getCacheStats: vi.fn().mockResolvedValue([
      { name: 'app-cache-v1', size: 15 },
      { name: 'api-cache-v1', size: 8 }
    ]),
    checkConnectivity: vi.fn().mockResolvedValue(true),
    requestBackgroundSync: vi.fn().mockResolvedValue(true),
    installApp: vi.fn().mockResolvedValue(true),
    handleFileOpen: vi.fn(),
    handleProtocolAction: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePWA.mockReturnValue(defaultMockState)
  })

  describe('Estado General de PWA', () => {
    it('debe mostrar el estado de la PWA correctamente', async () => {
      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Estado de la PWA')).toBeInTheDocument()
        expect(screen.getByText('Aplicación instalada')).toBeInTheDocument()
        expect(screen.getByText('Sí')).toBeInTheDocument()
      })
    })

    it('debe mostrar el estado de conexión', async () => {
      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Estado de conexión')).toBeInTheDocument()
        expect(screen.getByText('En línea')).toBeInTheDocument()
      })
    })

    it('debe mostrar estado offline cuando no hay conexión', async () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isOnline: false
      })

      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Offline')).toBeInTheDocument()
      })
    })
  })

  describe('Información de la Aplicación', () => {
    it('debe mostrar información de la aplicación', async () => {
      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Información de la Aplicación')).toBeInTheDocument()
        expect(screen.getByText('CRM Asesoría')).toBeInTheDocument()
        expect(screen.getByText('1.0.0')).toBeInTheDocument()
        expect(screen.getByText('development')).toBeInTheDocument()
      })
    })

    it('debe mostrar badges correctos para PWA standalone', async () => {
      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Es PWA')).toBeInTheDocument()
        expect(screen.getByText('Modo Standalone')).toBeInTheDocument()
      })
    })
  })

  describe('Información del Dispositivo', () => {
    it('debe mostrar información del dispositivo', async () => {
      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Información del Dispositivo')).toBeInTheDocument()
        expect(screen.getByText('Web')).toBeInTheDocument()
        expect(screen.getByText('es-ES')).toBeInTheDocument()
        expect(screen.getByText('8 GB')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
      })
    })

    it('debe mostrar tipo de dispositivo correcto', async () => {
      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Escritorio')).toBeInTheDocument()
      })
    })

    it('debe mostrar dispositivo móvil cuando corresponde', async () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        getDeviceInfo: vi.fn().mockReturnValue({
          ...defaultMockState.getDeviceInfo(),
          isMobile: true
        })
      })

      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Dispositivo móvil')).toBeInTheDocument()
      })
    })
  })

  describe('Cache y Almacenamiento', () => {
    it('debe mostrar estadísticas de cache', async () => {
      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('Cache y Almacenamiento')).toBeInTheDocument()
        expect(screen.getByText('app-cache-v1')).toBeInTheDocument()
        expect(screen.getByText('api-cache-v1')).toBeInTheDocument()
        expect(screen.getByText('15 elementos almacenados')).toBeInTheDocument()
      })
    })

    it('debe poder limpiar el cache', async () => {
      const mockClearCache = vi.fn().mockResolvedValue(true)
      const mockGetCacheStats = vi.fn()
        .mockResolvedValueOnce([{ name: 'test-cache', size: 10 }])
        .mockResolvedValueOnce([])

      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        clearCache: mockClearCache,
        getCacheStats: mockGetCacheStats
      })

      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('test-cache')).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /limpiar todo el cache/i })
      fireEvent.click(clearButton)
      
      await waitFor(() => {
        expect(mockClearCache).toHaveBeenCalledTimes(1)
        expect(mockGetCacheStats).toHaveBeenCalledTimes(2)
      })
    })

    it('debe mostrar mensaje cuando no hay cache', async () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        getCacheStats: vi.fn().mockResolvedValue([])
      })

      render(<PWAInfoPanel />)
      
      await waitFor(() => {
        expect(screen.getByText('No hay datos de cache disponibles')).toBeInTheDocument()
      })
    })
  })

  describe('Estados de Carga', () => {
    it('debe mostrar estado de carga inicial', () => {
      // Mock que simula un estado de carga lento
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        getCacheStats: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)))
      })

      render(<PWAInfoPanel />)
      
      expect(screen.getByText('Cargando información...')).toBeInTheDocument()
    })
  })
})
