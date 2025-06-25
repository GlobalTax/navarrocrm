
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PWAStatusManager } from '@/components/pwa/PWAStatusManager'

// Mock del hook usePWA
vi.mock('@/hooks/usePWA', () => ({
  usePWA: vi.fn()
}))

// Mock del componente PWAInstallPrompt
vi.mock('@/components/pwa/PWAInstallPrompt', () => ({
  PWAInstallPrompt: vi.fn(({ showOfflineStatus, showUpdatePrompt }) => (
    <div data-testid="pwa-install-prompt">
      <span>showOfflineStatus: {showOfflineStatus.toString()}</span>
      <span>showUpdatePrompt: {showUpdatePrompt.toString()}</span>
    </div>
  ))
}))

const mockUsePWA = vi.mocked(await import('@/hooks/usePWA')).usePWA

describe('PWAStatusManager', () => {
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
      isMobile: false
    }),
    getAppInfo: vi.fn().mockReturnValue({
      name: 'CRM Asesoría',
      version: '1.0.0'
    }),
    checkConnectivity: vi.fn().mockResolvedValue(true),
    clearCache: vi.fn().mockResolvedValue(true),
    getCacheStats: vi.fn().mockResolvedValue([]),
    requestBackgroundSync: vi.fn().mockResolvedValue(true),
    installApp: vi.fn().mockResolvedValue(true),
    handleFileOpen: vi.fn(),
    handleProtocolAction: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePWA.mockReturnValue(defaultMockState)
  })

  it('debe renderizar PWAInstallPrompt con props por defecto', () => {
    render(<PWAStatusManager />)
    
    expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument()
    expect(screen.getByText('showOfflineStatus: true')).toBeInTheDocument()
    expect(screen.getByText('showUpdatePrompt: true')).toBeInTheDocument()
  })

  it('debe pasar props personalizadas a PWAInstallPrompt', () => {
    render(
      <PWAStatusManager 
        showInstallPrompt={false}
        showOfflineStatus={false}
        showUpdatePrompt={false}
      />
    )
    
    expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument()
    expect(screen.getByText('showOfflineStatus: false')).toBeInTheDocument()
    expect(screen.getByText('showUpdatePrompt: false')).toBeInTheDocument()
  })

  it('no debe renderizar cuando la app está instalada y no se muestran otros indicadores', () => {
    mockUsePWA.mockReturnValue({
      ...defaultMockState,
      isInstalled: true,
      isInstallable: false
    })

    const { container } = render(
      <PWAStatusManager 
        showUpdatePrompt={false}
        showOfflineStatus={false}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('debe renderizar cuando la app está instalada pero se muestran otros indicadores', () => {
    mockUsePWA.mockReturnValue({
      ...defaultMockState,
      isInstalled: true,
      isInstallable: false
    })

    render(<PWAStatusManager showUpdatePrompt={true} />)
    
    expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument()
  })
})
