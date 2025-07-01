
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configurar servidor MSW con los handlers
export const server = setupServer(...handlers)
