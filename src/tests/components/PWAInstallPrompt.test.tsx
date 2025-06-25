
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'

// Mock del hook usePWA
vi.mock('@/hooks/usePWA', () => ({
  usePWA: vi.fn()
}))

const mockUsePWA = vi.mocked(await import('@/hooks/usePWA')).usePWA

describe('PWAInstallPrompt', () => {
  const defaultMockState = {
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
      isMobile: false,
      language: 'es-ES'
    }),
    getAppInfo: vi.fn().mockReturnValue({
      name: 'CRM Asesoría',
      version: '1.0.0',
      isPWA: true
    }),
    checkConnectivity: vi.fn().mockResolvedValue(true),
    clearCache: vi.fn().mockResolvedValue(true),
    getCacheStats: vi.fn().mockResolvedValue([])
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePWA.mockReturnValue(defaultMockState)
  })

  describe('Prompt de Instalación', () => {
    it('debe mostrar el prompt cuando la app es instalable', () => {
      render(<PWAInstallPrompt />)
      
      expect(screen.getByText('Instalar App')).toBeInTheDocument()
      expect(screen.getByText(/Instala CRM Asesoría/)).toBeInTheDocument()
    })

    it('no debe mostrar el prompt cuando la app ya está instalada', () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isInstalled: true,
        isInstallable: false
      })

      render(<PWAInstallPrompt />)
      
      expect(screen.queryByText('Instalar App')).not.toBeInTheDocument()
    })

    it('debe llamar a installPWA cuando se hace clic en Instalar', async () => {
      const mockInstallPWA = vi.fn().mockResolvedValue(true)
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        installPWA: mockInstallPWA
      })

      render(<PWAInstallPrompt />)
      
      const installButton = screen.getByRole('button', { name: /instalar/i })
      fireEvent.click(installButton)
      
      await waitFor(() => {
        expect(mockInstallPWA).toHaveBeenCalledTimes(1)
      })
    })

    it('debe cerrar el prompt cuando se hace clic en Más tarde', () => {
      const onClose = vi.fn()
      render(<PWAInstallPrompt onClose={onClose} />)
      
      const laterButton = screen.getByRole('button', { name: /más tarde/i })
      fireEvent.click(laterButton)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('debe mostrar las características de la PWA', () => {
      render(<PWAInstallPrompt />)
      
      expect(screen.getByText(/Acceso rápido desde el escritorio/)).toBeInTheDocument()
      expect(screen.getByText(/Funciona sin conexión/)).toBeInTheDocument()
      expect(screen.getByText(/Actualizaciones automáticas/)).toBeInTheDocument()
    })
  })

  describe('Prompt de Actualización', () => {
    it('debe mostrar el prompt de actualización cuando hay una actualización disponible', () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isInstalled: true,
        isInstallable: false,
        isUpdateAvailable: true
      })

      render(<PWAInstallPrompt showUpdatePrompt={true} />)
      
      expect(screen.getByText(/Nueva versión disponible/)).toBeInTheDocument()
    })

    it('debe mostrar texto diferente cuando la actualización está lista', () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isInstalled: true,
        isInstallable: false,
        isUpdateReady: true
      })

      render(<PWAInstallPrompt showUpdatePrompt={true} />)
      
      expect(screen.getByText(/Actualización lista/)).toBeInTheDocument()
    })

    it('debe llamar a updatePWA cuando se hace clic en Actualizar', async () => {
      const mockUpdatePWA = vi.fn()
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isInstalled: true,
        isInstallable: false,
        isUpdateReady: true,
        updatePWA: mockUpdatePWA
      })

      render(<PWAInstallPrompt showUpdatePrompt={true} />)
      
      const updateButton = screen.getByRole('button', { name: /actualizar/i })
      fireEvent.click(updateButton)
      
      await waitFor(() => {
        expect(mockUpdatePWA).toHaveBeenCalledTimes(1)
      })
    })

    it('no debe mostrar el prompt de actualización cuando showUpdatePrompt es false', () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isInstalled: true,
        isInstallable: false,
        isUpdateAvailable: true
      })

      render(<PWAInstallPrompt showUpdatePrompt={false} />)
      
      expect(screen.queryByText(/Nueva versión disponible/)).not.toBeInTheDocument()
    })
  })

  describe('Indicador de Estado Offline', () => {
    it('debe mostrar el indicador offline cuando no hay conexión', () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isOnline: false
      })

      render(<PWAInstallPrompt showOfflineStatus={true} />)
      
      expect(screen.getByText('Modo offline')).toBeInTheDocument()
      expect(screen.getByText('Sin conexión')).toBeInTheDocument()
    })

    it('debe mostrar el indicador online cuando hay conexión', () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isOnline: true
      })

      render(<PWAInstallPrompt showOfflineStatus={true} />)
      
      expect(screen.getByText('Conectado')).toBeInTheDocument()
    })

    it('no debe mostrar indicadores cuando showOfflineStatus es false', () => {
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isOnline: false
      })

      render(<PWAInstallPrompt showOfflineStatus={false} />)
      
      expect(screen.queryByText('Modo offline')).not.toBeInTheDocument()
      expect(screen.queryByText('Conectado')).not.toBeInTheDocument()
    })

    it('debe llamar a syncData cuando se hace clic en el botón de sincronización', async () => {
      const mockSyncData = vi.fn()
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        isOnline: true,
        syncData: mockSyncData
      })

      render(<PWAInstallPrompt showOfflineStatus={true} />)
      
      // El botón de sync está dentro del indicador de conectado
      const syncButton = screen.getByRole('button')
      fireEvent.click(syncButton)
      
      await waitFor(() => {
        expect(mockSyncData).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Manejo de Errores', () => {
    it('debe manejar errores en la instalación', async () => {
      const mockInstallPWA = vi.fn().mockResolvedValue(false)
      mockUsePWA.mockReturnValue({
        ...defaultMockState,
        installPWA: mockInstallPWA
      })

      render(<PWAInstallPrompt />)
      
      const installButton = screen.getByRole('button', { name: /instalar/i })
      fireEvent.click(installButton)
      
      await waitFor(() => {
        expect(mockInstallPWA).toHaveBeenCalledTimes(1)
      })
      
      // El componente debería seguir visible después del error
      expect(screen.getByText('Instalar App')).toBeInTheDocument()
    })
  })
})
