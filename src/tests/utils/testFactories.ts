import { vi } from 'vitest'

// Testing Factories - Generadores de datos mock para testing

export interface MockUser {
  id: string
  email: string
  org_id: string
  role: string
  name: string
  created_at: string
  updated_at: string
}

export interface MockClient {
  id: string
  name: string
  email: string | null
  phone: string | null
  client_type: string
  dni_nif: string | null
  status: string
  created_at: string
  org_id: string
}

export interface MockCase {
  id: string
  title: string
  description: string | null
  status: string
  practice_area: string
  client_id: string
  responsible_solicitor_id: string
  created_at: string
  org_id: string
}

export interface MockProposal {
  id: string
  title: string
  status: string
  total_amount: number
  is_recurring: boolean
  client_id: string
  created_at: string
  org_id: string
}

export interface MockTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assigned_to: string | null
  case_id: string | null
  due_date: string | null
  created_at: string
  org_id: string
}

// Factory functions para crear datos mock
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: 'test@example.com',
  org_id: 'test-org-id',
  role: 'senior',
  name: 'Test User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockClient = (overrides: Partial<MockClient> = {}): MockClient => ({
  id: `client-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Client S.L.',
  email: 'client@example.com',
  phone: '+34 600 123 456',
  client_type: 'empresa',
  dni_nif: 'B12345678',
  status: 'activo',
  created_at: new Date().toISOString(),
  org_id: 'test-org-id',
  ...overrides,
})

export const createMockCase = (overrides: Partial<MockCase> = {}): MockCase => ({
  id: `case-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Consulta Fiscal Trimestral',
  description: 'Revisión de obligaciones fiscales del trimestre',
  status: 'open',
  practice_area: 'fiscal',
  client_id: 'test-client-id',
  responsible_solicitor_id: 'test-user-id',
  created_at: new Date().toISOString(),
  org_id: 'test-org-id',
  ...overrides,
})

export const createMockProposal = (overrides: Partial<MockProposal> = {}): MockProposal => ({
  id: `proposal-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Propuesta Consultoría Legal',
  status: 'draft',
  total_amount: 1500.00,
  is_recurring: false,
  client_id: 'test-client-id',
  created_at: new Date().toISOString(),
  org_id: 'test-org-id',
  ...overrides,
})

export const createMockTask = (overrides: Partial<MockTask> = {}): MockTask => ({
  id: `task-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Revisar documentación',
  description: 'Revisar y validar documentación del cliente',
  status: 'pending',
  priority: 'medium',
  assigned_to: 'test-user-id',
  case_id: 'test-case-id',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  org_id: 'test-org-id',
  ...overrides,
})

// Funciones para crear múltiples elementos
export const createMockUsers = (count: number, baseOverrides: Partial<MockUser> = {}): MockUser[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({ 
      ...baseOverrides, 
      email: `user${index + 1}@example.com`,
      name: `Test User ${index + 1}`
    })
  )
}

export const createMockClients = (count: number, baseOverrides: Partial<MockClient> = {}): MockClient[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockClient({ 
      ...baseOverrides, 
      name: `Test Client ${index + 1} S.L.`,
      email: `client${index + 1}@example.com`,
      dni_nif: `B1234567${index}`
    })
  )
}

export const createMockCases = (count: number, baseOverrides: Partial<MockCase> = {}): MockCase[] => {
  const practiceAreas = ['fiscal', 'civil', 'laboral', 'mercantil', 'penal']
  const statuses = ['open', 'in_progress', 'review', 'closed']
  
  return Array.from({ length: count }, (_, index) => 
    createMockCase({ 
      ...baseOverrides, 
      title: `Caso ${index + 1} - ${practiceAreas[index % practiceAreas.length]}`,
      practice_area: practiceAreas[index % practiceAreas.length],
      status: statuses[index % statuses.length]
    })
  )
}

// Escenarios completos para testing
export const createLegalFirmScenario = () => {
  const org_id = 'legal-firm-org-id'
  
  const users = [
    createMockUser({ role: 'partner', name: 'Partner Principal', org_id }),
    createMockUser({ role: 'senior', name: 'Senior Associate', org_id }),
    createMockUser({ role: 'junior', name: 'Junior Associate', org_id }),
  ]
  
  const clients = createMockClients(5, { org_id })
  const cases = createMockCases(8, { 
    org_id,
    client_id: clients[0].id,
    responsible_solicitor_id: users[1].id 
  })
  
  return {
    org_id,
    users,
    clients,
    cases,
    tasks: Array.from({ length: 12 }, (_, index) => 
      createMockTask({
        org_id,
        case_id: cases[index % cases.length].id,
        assigned_to: users[(index % 2) + 1].id
      })
    )
  }
}

// Mock contexts para testing
export const createMockAppContext = (overrides = {}) => ({
  user: createMockUser(),
  session: { user: { id: 'test-user-id' } },
  authLoading: false,
  isSetup: true,
  setupLoading: false,
  isInitializing: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
})

export const createMockGlobalContext = (overrides = {}) => ({
  isLoading: false,
  error: null,
  notifications: [],
  sidebarCollapsed: false,
  theme: 'light' as const,
  language: 'es' as const,
  setLoading: vi.fn(),
  setError: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  markAsRead: vi.fn(),
  clearNotifications: vi.fn(),
  markAllAsRead: vi.fn(),
  toggleSidebar: vi.fn(),
  setTheme: vi.fn(),
  setLanguage: vi.fn(),
  ...overrides,
})
