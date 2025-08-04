
import { render, screen, waitFor } from '@/test-utils/test-helpers'
import { describe, it, expect, vi } from 'vitest'
import EmergencyApp from '@/EmergencyApp'

// Mock de Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

describe('Authentication Flow', () => {
  it('should show login page when user is not authenticated', async () => {
    render(<EmergencyApp />)
    
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
    })
  })

  it('should redirect to dashboard when user is authenticated', async () => {
    const mockSession = {
      user: { id: '123', email: 'test@example.com' },
      access_token: 'mock-token'
    }

    vi.doMock('@/integrations/supabase/client', () => ({
      supabase: {
        auth: {
          getSession: vi.fn(() => Promise.resolve({ 
            data: { session: mockSession }, 
            error: null 
          })),
          onAuthStateChange: vi.fn(() => ({
            data: { subscription: { unsubscribe: vi.fn() } }
          }))
        }
      }
    }))

    render(<EmergencyApp />)
    
    await waitFor(() => {
      // Verificar que no se muestra la página de login
      expect(screen.queryByText(/iniciar sesión/i)).not.toBeInTheDocument()
    })
  })
})
