
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMockAppContext, createMockGlobalContext } from './testFactories'

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

export const AllProviders: React.FC<AllProvidersProps> = ({ 
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
      <QueryClientProvider client={testQueryClient}>
        <MockGlobalStateProvider value={globalContextValue}>
          <MockAppProvider value={appContextValue}>
            {children}
          </MockAppProvider>
        </MockGlobalStateProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
