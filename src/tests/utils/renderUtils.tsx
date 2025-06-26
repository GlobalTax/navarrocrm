
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryProvider } from '@tanstack/react-query'
import { createMockAppContext, createMockGlobalContext } from './testFactories'

// ==================== PROVIDERS MOCK ====================

// Mock del contexto de la aplicación
const AppContext = React.createContext(createMockAppContext())

export const MockAppProvider: React.FC<{ 
  children: React.ReactNode
  value?: any 
}> = ({ children, value = {} }) => {
  const mockValue = { ...createMockAppContext(), ...value }
  return (
    <AppContext.Provider value={mockValue}>
      {children}
    </AppContext.Provider>
  )
}

// Mock del contexto global
const GlobalStateContext = React.createContext(createMockGlobalContext())

export const MockGlobalStateProvider: React.FC<{ 
  children: React.ReactNode
  value?: any 
}> = ({ children, value = {} }) => {
  const mockValue = { ...createMockGlobalContext(), ...value }
  return (
    <GlobalStateContext.Provider value={mockValue}>
      {children}
    </GlobalStateContext.Provider>
  )
}

// Provider completo para tests
interface AllProvidersProps {
  children: React.ReactNode
  appContextValue?: any
  globalContextValue?: any
  queryClient?: QueryClient
  initialRoute?: string
}

const AllProviders: React.FC<AllProvidersProps> = ({ 
  children, 
  appContextValue,
  globalContextValue,
  queryClient,
  initialRoute = '/'
}) => {
  const testQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  // Navegar a la ruta inicial si es necesario
  if (initialRoute !== '/' && window.location.pathname !== initialRoute) {
    window.history.pushState({}, 'Test page', initialRoute)
  }

  return (
    <BrowserRouter>
      <QueryProvider client={testQueryClient}>
        <MockGlobalStateProvider value={globalContextValue}>
          <MockAppProvider value={appContextValue}>
            {children}
          </MockAppProvider>
        </MockGlobalStateProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}

// ==================== RENDER UTILITIES ====================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  appContextValue?: any
  globalContextValue?: any
  queryClient?: QueryClient
  initialRoute?: string
  userEventOptions?: Parameters<typeof userEvent.setup>[0]
}

// Función de renderizado personalizada con todos los providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    appContextValue,
    globalContextValue,
    queryClient,
    initialRoute,
    userEventOptions = {},
    ...renderOptions
  } = options

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders
      appContextValue={appContextValue}
      globalContextValue={globalContextValue}
      queryClient={queryClient}
      initialRoute={initialRoute}
    >
      {children}
    </AllProviders>
  )

  const user = userEvent.setup(userEventOptions)

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Renderizado rápido sin providers (para componentes que no los necesitan)
export const renderComponent = (ui: React.ReactElement, options: RenderOptions = {}) => {
  const user = userEvent.setup()
  return {
    user,
    ...render(ui, options),
  }
}

// ==================== TESTING UTILITIES ====================

// Esperar a que un elemento aparezca en el DOM
export const waitForElement = async (selector: string, timeout = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Timeout de seguridad
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}

// Esperar a que una condición se cumpla
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    if (condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

// Simular delay para testing
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

// Helper para debug en tests
export const debugElement = (element: Element | null) => {
  if (element) {
    console.log('Element HTML:', element.outerHTML)
    console.log('Element text content:', element.textContent)
  } else {
    console.log('Element not found')
  }
}

// ==================== SUPABASE MOCKS ====================

// Mock de respuesta de Supabase exitosa
export const createSupabaseSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
})

// Mock de respuesta de Supabase con error
export const createSupabaseErrorResponse = (message: string, code?: string) => ({
  data: null,
  error: {
    message,
    code,
    details: null,
    hint: null,
  },
  status: 400,
  statusText: 'Bad Request',
})

// ==================== QUERY TESTING UTILITIES ====================

// Crear un Query Client para tests con configuración específica
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
})

// Mock de hooks de React Query
export const mockUseQuery = (data: any, isLoading = false, error: any = null) => ({
  data,
  isLoading,
  error,
  isError: !!error,
  isSuccess: !isLoading && !error,
  refetch: vi.fn(),
  remove: vi.fn(),
})

export const mockUseMutation = (mutateAsync?: any) => ({
  mutate: vi.fn(),
  mutateAsync: mutateAsync || vi.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: null,
  reset: vi.fn(),
})
