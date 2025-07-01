
import { render, screen, fireEvent, waitFor } from '@/test-utils/test-helpers'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { useAIChat } from '@/components/ai/useAIChat'

// Mock para el hook useAIChat
vi.mock('@/components/ai/useAIChat', () => ({
  useAIChat: vi.fn(() => ({
    messages: [],
    isLoading: false,
    sendMessage: vi.fn()
  }))
}))

const mockUseAIChat = vi.mocked(useAIChat)

describe('AIAssistant', () => {
  const defaultProps = {
    isOpen: true,
    onToggle: vi.fn(),
    onMinimize: vi.fn(),
    isMinimized: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render chat interface when open', () => {
    render(<AIAssistant {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Escribe tu pregunta aquí...')).toBeInTheDocument()
    expect(screen.getByText('Enviar')).toBeInTheDocument()
  })

  it('should send message when form is submitted', async () => {
    const mockSendMessage = vi.fn()
    
    mockUseAIChat.mockReturnValue({
      messages: [],
      isLoading: false,
      sendMessage: mockSendMessage
    })

    render(<AIAssistant {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Escribe tu pregunta aquí...')
    const submitButton = screen.getByText('Enviar')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
    })
  })

  it('should display messages', () => {
    mockUseAIChat.mockReturnValue({
      messages: [
        { id: '1', content: 'Hello', role: 'user', timestamp: new Date() },
        { id: '2', content: 'Hi there!', role: 'assistant', timestamp: new Date() }
      ],
      isLoading: false,
      sendMessage: vi.fn()
    })

    render(<AIAssistant {...defaultProps} />)
    
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    mockUseAIChat.mockReturnValue({
      messages: [],
      isLoading: true,
      sendMessage: vi.fn()
    })

    render(<AIAssistant {...defaultProps} />)
    
    expect(screen.getByText('Enviando...')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<AIAssistant {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByPlaceholderText('Escribe tu pregunta aquí...')).not.toBeInTheDocument()
  })
})
