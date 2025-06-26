
import { vi } from 'vitest'

// ==================== TIPOS DE DATOS CRM ====================

export interface MockUser {
  id: string
  email: string
  org_id: string
  role: 'admin' | 'senior' | 'junior' | 'finance'
  name?: string
  created_at: string
  last_sign_in_at?: string
}

export interface MockClient {
  id: string
  name: string
  email?: string
  phone?: string
  client_type: 'persona' | 'empresa'
  dni_nif?: string
  status: 'activo' | 'inactivo' | 'prospecto'
  org_id: string
  created_at: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  business_sector?: string
  hourly_rate?: number
}

export interface MockCase {
  id: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'closed' | 'archived'
  practice_area: 'civil' | 'penal' | 'laboral' | 'mercantil' | 'fiscal'
  client_id: string
  responsible_solicitor_id: string
  org_id: string
  created_at: string
  due_date?: string
  estimated_hours?: number
}

export interface MockProposal {
  id: string
  title: string
  description?: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  total_amount: number
  is_recurring: boolean
  client_id: string
  org_id: string
  created_at: string
  valid_until?: string
  services?: any[]
}

export interface MockTask {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  case_id?: string
  assigned_to?: string
  org_id: string
  created_at: string
  due_date?: string
  estimated_hours?: number
}

// ==================== FACTORY FUNCTIONS ====================

// Factory para crear usuarios mock
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: `user-${Math.random().toString(36).substring(2, 9)}`,
  email: `test-${Math.random().toString(36).substring(2, 5)}@example.com`,
  org_id: `org-${Math.random().toString(36).substring(2, 9)}`,
  role: 'senior',
  name: 'Test User',
  created_at: new Date().toISOString(),
  ...overrides,
})

// Factory para crear clientes mock
export const createMockClient = (overrides: Partial<MockClient> = {}): MockClient => ({
  id: `client-${Math.random().toString(36).substring(2, 9)}`,
  name: 'Test Client S.L.',
  email: `client-${Math.random().toString(36).substring(2, 5)}@example.com`,
  phone: '+34 600 000 000',
  client_type: 'empresa',
  dni_nif: `B${Math.floor(10000000 + Math.random() * 90000000)}`,
  status: 'activo',
  org_id: `org-${Math.random().toString(36).substring(2, 9)}`,
  created_at: new Date().toISOString(),
  address_city: 'Madrid',
  business_sector: 'tecnologia',
  hourly_rate: 150,
  ...overrides,
})

// Factory para crear casos mock
export const createMockCase = (overrides: Partial<MockCase> = {}): MockCase => ({
  id: `case-${Math.random().toString(36).substring(2, 9)}`,
  title: 'Caso de Prueba',
  description: 'Descripción del caso de prueba',
  status: 'open',
  practice_area: 'civil',
  client_id: `client-${Math.random().toString(36).substring(2, 9)}`,
  responsible_solicitor_id: `user-${Math.random().toString(36).substring(2, 9)}`,
  org_id: `org-${Math.random().toString(36).substring(2, 9)}`,
  created_at: new Date().toISOString(),
  estimated_hours: 10,
  ...overrides,
})

// Factory para crear propuestas mock
export const createMockProposal = (overrides: Partial<MockProposal> = {}): MockProposal => ({
  id: `proposal-${Math.random().toString(36).substring(2, 9)}`,
  title: 'Propuesta de Servicios Legales',
  description: 'Descripción de la propuesta',
  status: 'draft',
  total_amount: 2500,
  is_recurring: false,
  client_id: `client-${Math.random().toString(36).substring(2, 9)}`,
  org_id: `org-${Math.random().toString(36).substring(2, 9)}`,
  created_at: new Date().toISOString(),
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
})

// Factory para crear tareas mock
export const createMockTask = (overrides: Partial<MockTask> = {}): MockTask => ({
  id: `task-${Math.random().toString(36).substring(2, 9)}`,
  title: 'Tarea de Prueba',
  description: 'Descripción de la tarea',
  status: 'pending',
  priority: 'medium',
  org_id: `org-${Math.random().toString(36).substring(2, 9)}`,
  created_at: new Date().toISOString(),
  estimated_hours: 2,
  ...overrides,
})

// ==================== BATCH FACTORIES ====================

// Crear múltiples entidades
export const createMockUsers = (count: number, baseOverrides: Partial<MockUser> = {}): MockUser[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({ 
      name: `Test User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      ...baseOverrides 
    })
  )
}

export const createMockClients = (count: number, baseOverrides: Partial<MockClient> = {}): MockClient[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockClient({ 
      name: `Cliente ${index + 1} S.L.`,
      email: `cliente${index + 1}@example.com`,
      ...baseOverrides 
    })
  )
}

export const createMockCases = (count: number, baseOverrides: Partial<MockCase> = {}): MockCase[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockCase({ 
      title: `Caso ${index + 1}`,
      ...baseOverrides 
    })
  )
}

// ==================== SCENARIO BUILDERS ====================

// Escenarios completos para testing
export const createLegalFirmScenario = (orgId: string) => {
  const users = [
    createMockUser({ org_id: orgId, role: 'admin', name: 'Admin Principal', email: 'admin@bufete.com' }),
    createMockUser({ org_id: orgId, role: 'senior', name: 'Abogado Senior', email: 'senior@bufete.com' }),
    createMockUser({ org_id: orgId, role: 'junior', name: 'Abogado Junior', email: 'junior@bufete.com' }),
    createMockUser({ org_id: orgId, role: 'finance', name: 'Responsable Finanzas', email: 'finance@bufete.com' }),
  ]

  const clients = [
    createMockClient({ org_id: orgId, client_type: 'empresa', business_sector: 'tecnologia' }),
    createMockClient({ org_id: orgId, client_type: 'persona' }),
    createMockClient({ org_id: orgId, status: 'prospecto' }),
  ]

  const cases = [
    createMockCase({ 
      org_id: orgId, 
      client_id: clients[0].id, 
      responsible_solicitor_id: users[1].id,
      practice_area: 'mercantil',
      status: 'in_progress'
    }),
    createMockCase({ 
      org_id: orgId, 
      client_id: clients[1].id, 
      responsible_solicitor_id: users[2].id,
      practice_area: 'civil',
      status: 'open'
    }),
  ]

  const proposals = [
    createMockProposal({ 
      org_id: orgId, 
      client_id: clients[2].id,
      status: 'sent',
      is_recurring: false
    }),
    createMockProposal({ 
      org_id: orgId, 
      client_id: clients[0].id,
      status: 'accepted',
      is_recurring: true
    }),
  ]

  return { users, clients, cases, proposals }
}

// ==================== CONTEXT MOCKS ====================

// Mock del contexto de la aplicación
export const createMockAppContext = (overrides: any = {}) => ({
  user: createMockUser(),
  session: { user: { id: 'test-user-id' } },
  authLoading: false,
  isSetup: true,
  setupLoading: false,
  isInitializing: false,
  signIn: vi.fn().mockResolvedValue({ error: null }),
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  ...overrides,
})

// Mock del contexto global
export const createMockGlobalContext = (overrides: any = {}) => ({
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
