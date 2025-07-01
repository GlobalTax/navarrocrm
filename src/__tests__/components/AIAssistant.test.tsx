
import { render, screen, waitFor } from '@/test-utils/test-helpers'
import { describe, it, expect, vi } from 'vitest'
import { AIAssistant } from '@/components/ai/AIAssistant'

// Mock para el hook useAIAssistant
vi.mock('@/hooks/useAIAssistant', () => ({
  useAIAssistant: () => ({
    messages: [],
    isLoading: false,
    sendMessage: vi.fn(),
    clearMessages: vi.fn()
  })
}))

describe('AIAssistant', () => {
  it('should render chat interface', () => {
    render(<AIAssistant />)
    
    expect(screen.getByPlaceholderText('Escribe tu pregunta aquí...')).toBeInTheDocument()
    expect(screen.getByText('Enviar')).toBeInTheDocument()
  })

  it('should send message when form is submitted', async () => {
    const mockSendMessage = vi.fn()
    
    vi.mocked(useAIAssistant).mockReturnValue({
      messages: [],
      isLoading: false,
      sendMessage: mockSendMessage,
      clearMessages: vi.fn()
    })

    const { user } = render(<AIAssistant />)
    
    const input = screen.getByPlaceholderText('Escribe tu pregunta aquí...')
    const submitButton = screen.getByText('Enviar')
    
    await user.type(input, 'Test message')
    await user.click(submitButton)
    
    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('should display messages', () => {
    vi.mocked(useAIAssistant).mockReturnValue({
      messages: [
        { id: '1', content: 'Hello', role: 'user', timestamp: new Date() },
        { id: '2', content: 'Hi there!', role: 'assistant', timestamp: new Date() }
      ],
      isLoading: false,
      sendMessage: vi.fn(),
      clearMessages: vi.fn()
    })

    render(<AIAssistant />)
    
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    vi.mocked(useAIAssistant).mockReturnValue({
      messages: [],
      isLoading: true,
      sendMessage: vi.fn(),
      clearMessages: vi.fn()
    })

    render(<AIAssistant />)
    
    expect(screen.getByText('Enviando...')).toBeInTheDocument()
  })
})
