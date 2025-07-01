
import { render, screen, waitFor } from '@/test-utils/test-helpers'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import { server } from '@/test-utils/mocks/server'
import { http, HttpResponse } from 'msw'

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    vi.clearAllMocks()
  })

  it('should show login form when not authenticated', () => {
    render(<Login />)
    
    expect(screen.getByText('CRM Legal')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('should handle login form submission', async () => {
    // Mock successful login
    server.use(
      http.post('*/auth/v1/token', () => {
        return HttpResponse.json({
          access_token: 'mock-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        })
      })
    )

    const { user } = render(<Login />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    // Verificar que se muestra el estado de carga
    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
  })

  it('should show error message on login failure', async () => {
    // Mock failed login
    server.use(
      http.post('*/auth/v1/token', () => {
        return HttpResponse.json(
          { error: 'Invalid login credentials' },
          { status: 400 }
        )
      })
    )

    const { user } = render(<Login />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    
    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      // El componente toast mostrará el error
      expect(document.body).toHaveTextContent('Email o contraseña incorrectos')
    })
  })

  it('should validate required fields', async () => {
    const { user } = render(<Login />)
    
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    
    // Intentar enviar sin datos
    await user.click(submitButton)
    
    // El botón debe estar deshabilitado
    expect(submitButton).toBeDisabled()
  })
})
