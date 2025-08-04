# Testing Guide

## 🧪 Testing Strategy

### Test Pyramid
```
    E2E Tests (Few)
       ↗️     ↖️
Integration Tests (Some)
       ↗️     ↖️
  Unit Tests (Many)
```

### Test Types
- **Unit Tests**: Funciones, hooks, utilities individuales
- **Integration Tests**: Interacción entre módulos
- **Performance Tests**: Rendimiento y memory usage
- **Accessibility Tests**: A11y compliance

## 📁 Test Structure

```
src/test/
├── testUtils.ts          # Utilidades compartidas
├── setup.ts             # Configuración global
├── basic.test.ts        # Tests básicos
├── features/            # Tests por feature
│   └── features.test.ts
└── performance/         # Tests de rendimiento
    └── performance.test.ts
```

## 🛠️ Test Utilities

### Mock Factories
```typescript
// Crear datos de prueba
const contact = createMockContact({
  first_name: 'Jane',
  company: 'Test Corp'
})

const testCase = createMockCase({
  status: 'completed',
  priority: 'high'
})
```

### Performance Testing
```typescript
// Medir tiempo de ejecución
const time = await measurePerformance(async () => {
  // operación a medir
})

// Verificar memory usage
const memory = getMemoryUsage()
expect(memory.used).toBeLessThan(100) // MB
```

## 🎯 Testing Best Practices

### Unit Tests
```typescript
// ✅ Test individual functions
describe('calculateTotal', () => {
  it('should sum numbers correctly', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6)
  })
  
  it('should handle empty array', () => {
    expect(calculateTotal([])).toBe(0)
  })
})
```

### Integration Tests
```typescript
// ✅ Test feature interactions
describe('Contact-Case Integration', () => {
  it('should associate cases with contacts', () => {
    const contact = createMockContact()
    const testCase = createMockCase({ 
      client_id: contact.id 
    })
    
    expect(testCase.client_id).toBe(contact.id)
  })
})
```

### Performance Tests
```typescript
// ✅ Test performance budgets
describe('Performance', () => {
  it('should load components quickly', async () => {
    const loadTime = await measurePerformance(async () => {
      // load component
    })
    
    expect(loadTime).toBeLessThan(16) // 60fps
  })
})
```

## 🚀 Running Tests

### Basic Commands
```bash
# Ejecutar todos los tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests específicos
npm run test:features
npm run test:performance
```

### Coverage Targets
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## 📊 Test Configuration

### Vitest Setup
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})
```

### Mock Configuration
```typescript
// setup.ts
// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    memory: {
      usedJSHeapSize: 1024 * 1024 * 10 // 10MB
    }
  }
})
```

## 🔍 Debugging Tests

### Common Issues
1. **JSX Errors**: Usar archivos .tsx para componentes
2. **Mock Problems**: Verificar setup.ts
3. **Async Issues**: Usar waitFor correctamente
4. **Memory Leaks**: Limpiar en afterEach

### Test Debugging
```typescript
// ✅ Debug con console.log
it('should debug issue', () => {
  const result = someFunction()
  console.log('Debug result:', result)
  expect(result).toBe(expected)
})

// ✅ Test aislado con .only
it.only('should test specific case', () => {
  // focus on this test
})
```

## 📋 Testing Checklist

### Before Commit
- [ ] Todos los tests pasan
- [ ] Coverage > 70%
- [ ] No tests skipped sin razón
- [ ] Performance tests dentro del budget
- [ ] Mocks actualizados

### New Feature Testing
- [ ] Unit tests para hooks/utilities
- [ ] Integration tests para flujos
- [ ] Performance tests si aplica
- [ ] Error boundary tests
- [ ] Edge cases cubiertos

## 🔧 Testing Tools

### Available Utilities
- `createMockContact()` - Mock contact data
- `createMockCase()` - Mock case data
- `createMockTask()` - Mock task data
- `measurePerformance()` - Performance timing
- `getMemoryUsage()` - Memory tracking

### Custom Matchers
```typescript
// ✅ Verificar performance
expect(loadTime).toBeLessThan(100)

// ✅ Verificar memoria
expect(memoryUsage).toBeWithinBudget(75)

// ✅ Verificar estructura
expect(mockData).toHaveValidStructure()
```