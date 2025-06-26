
// Testing Utilities - Sistema de Testing Mejorado CRM Asesoría

// Factory Functions para crear datos mock
export {
  createMockUser,
  createMockClient,
  createMockCase,
  createMockProposal,
  createMockTask,
  createMockUsers,
  createMockClients,
  createMockCases,
  createLegalFirmScenario,
  createMockAppContext,
  createMockGlobalContext
} from './testFactories'

// Render Utilities con providers
export {
  renderWithProviders,
  renderComponent,
  waitForElement,
  waitForCondition,
  delay,
  debugElement,
  createSupabaseSuccessResponse,
  createSupabaseErrorResponse,
  createTestQueryClient,
  mockUseQuery,
  mockUseMutation,
  MockAppProvider,
  MockGlobalStateProvider
} from './renderUtils'

// PWA Testing Utilities
export {
  createPWAMockState,
  PWAStates,
  simulatePWAEvents,
  createServiceWorkerMock,
  createCacheMock,
  NetworkTestUtils,
  NotificationTestUtils
} from './pwaTestUtils'

// Helpers específicos del setup
export {
  mockFetch,
  mockFetchError
} from '../setup'

// Tipos para TypeScript
export type {
  MockUser,
  MockClient,
  MockCase,
  MockProposal,
  MockTask
} from './testFactories'
