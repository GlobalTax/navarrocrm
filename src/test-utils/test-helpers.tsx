

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { screen, fireEvent, waitFor } from '@testing-library/dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '@/contexts/AppContext'

// Crear un wrapper personalizado para las pruebas
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProvider>
          {children}
        </AppProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Exportar todas las utilidades de testing explícitamente
export { customRender as render, screen, fireEvent, waitFor }

// También exportar todo lo demás de testing library
export * from '@testing-library/react'

