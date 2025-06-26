
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { AllProviders } from './testProviders'

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
