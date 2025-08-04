export const createTestQueryClient = () => {
  return {
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  }
}

export const createMockContact = (overrides = {}) => ({
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  ...overrides
})

export const createMockCase = (overrides = {}) => ({
  id: '1',
  title: 'Test Case',
  status: 'active',
  priority: 'high',
  ...overrides
})

export const createMockTask = (overrides = {}) => ({
  id: '1',
  title: 'Test Task',
  status: 'pending',
  priority: 'medium',
  ...overrides
})

export const measurePerformance = async (operation: () => Promise<void>) => {
  const start = performance.now()
  await operation()
  return performance.now() - start
}

export const getMemoryUsage = () => {
  const perf = (window as any).performance
  if (perf && perf.memory) {
    return {
      used: Math.round(perf.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(perf.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(perf.memory.jsHeapSizeLimit / 1024 / 1024)
    }
  }
  return null
}