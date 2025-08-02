# 🛠 Guía de Desarrollo CRM

## 🚀 Setup Inicial

### Prerrequisitos
- Node.js 18+ 
- Bun (recomendado) o npm
- Cuenta Supabase
- Git

### Instalación
```bash
# Clonar repositorio
git clone [repository-url]
cd crm-asesorias

# Instalar dependencias
bun install

# Setup variables de entorno
cp .env.example .env.local
# Configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# Ejecutar migraciones
bun run db:migrate

# Iniciar desarrollo
bun run dev
```

## 📂 Convenciones de Código

### Estructura de Features
```
src/features/[feature-name]/
├── components/          # Componentes específicos del feature
├── hooks/              # Hooks personalizados
├── services/           # Lógica de negocio y API calls
├── types/              # Tipos TypeScript
└── index.ts            # Export centralizado
```

### Naming Conventions
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useUserProfile.ts`)
- **Servicios**: camelCase (`userService.ts`)
- **Tipos**: PascalCase con sufijo apropiado (`UserProfileData`)

### Import Order
```typescript
// 1. Librerías externas
import React from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Componentes UI
import { Button } from '@/components/ui/button'

// 3. Features y utils internos
import { useUserProfile } from '@/features/auth'
import { logger } from '@/utils/logging'

// 4. Tipos
import type { UserProfile } from './types'
```

## 🎨 Sistema de Diseño

### Tokens Semánticos
```css
/* Usar SIEMPRE tokens semánticos */
/* ❌ INCORRECTO */
<div className="bg-white text-black border-gray-200" />

/* ✅ CORRECTO */
<div className="bg-background text-foreground border-border" />
```

### Componentes Base
- Extender siempre desde `@/components/ui/`
- Crear variantes en lugar de estilos inline
- Seguir el patrón de design tokens

### Responsive Design
```tsx
// Mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3" />
```

## 🪝 Hooks Patterns

### Custom Hooks
```typescript
// Siempre incluir logging y error handling
export const useFeatureData = (id: string) => {
  const logger = createLogger('useFeatureData')
  
  return useQuery({
    queryKey: ['feature', id],
    queryFn: async () => {
      logger.debug('Fetching feature data', { id })
      const result = await fetchFeatureData(id)
      logger.info('Feature data fetched successfully', { id, count: result.length })
      return result
    },
    onError: (error) => {
      logger.error('Failed to fetch feature data', { id, error })
    }
  })
}
```

### Performance Optimization
```typescript
// Usar useCallback para funciones pasadas como props
const handleSubmit = useCallback((data: FormData) => {
  // Handler logic
}, [dependencies])

// Usar useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return performExpensiveCalculation(data)
}, [data])
```

## 📝 Logging Guidelines

### Structured Logging
```typescript
import { createLogger } from '@/utils/logging'

const logger = createLogger('ComponentName')

// ✅ Logging estructurado
logger.info('User action completed', {
  action: 'create_proposal',
  userId: user.id,
  proposalId: result.id,
  duration: Date.now() - startTime
})

// ❌ Logging no estructurado
console.log('Proposal created!', result)
```

### Log Levels
- **debug**: Info detallada para desarrollo
- **info**: Operaciones normales
- **warn**: Situaciones que requieren atención
- **error**: Errores que afectan funcionalidad

## 🧪 Testing Best Practices

### Unit Tests
```typescript
import { createTestQueryClient, mockAuthUser } from '@/utils/testing'

describe('useUserProfile', () => {
  it('should fetch user profile successfully', async () => {
    const queryClient = createTestQueryClient()
    // Test implementation
  })
})
```

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { UserProfile } from './UserProfile'

test('renders user profile correctly', () => {
  render(<UserProfile user={mockAuthUser} />)
  expect(screen.getByText(mockAuthUser.email)).toBeInTheDocument()
})
```

## 🔄 State Management

### React Query Patterns
```typescript
// Queries para datos de solo lectura
const { data, isLoading, error } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => fetchUsers(filters)
})

// Mutations para operaciones de escritura
const { mutate, isPending } = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('Usuario creado correctamente')
  }
})
```

### Local State
```typescript
// useState para estado local simple
const [isOpen, setIsOpen] = useState(false)

// useReducer para estado complejo
const [state, dispatch] = useReducer(formReducer, initialState)
```

## 🔐 Security Guidelines

### Data Validation
```typescript
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['partner', 'senior', 'junior'])
})

// Validar SIEMPRE datos de entrada
const validateUserData = (data: unknown) => {
  return UserSchema.parse(data)
}
```

### RLS Policies
- Cada query debe incluir filtros por `org_id`
- Validar permisos en el frontend Y backend
- Logging de accesos para auditoría

## 🚀 Performance Guidelines

### Bundle Optimization
```typescript
// Lazy loading para routes
const UserManagement = lazy(() => import('@/pages/UserManagement'))

// Dynamic imports para componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### Memory Management
```typescript
// Cleanup en useEffect
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [])

// Evitar memory leaks en async operations
useEffect(() => {
  let cancelled = false
  
  const fetchData = async () => {
    const result = await api.getData()
    if (!cancelled) {
      setData(result)
    }
  }
  
  fetchData()
  return () => { cancelled = true }
}, [])
```

## 📊 Debugging Tools

### Development Tools
- React DevTools
- React Query DevTools
- Browser Network/Console tabs
- Supabase Studio

### Production Debugging
```typescript
// Logs estructurados para debugging
logger.debug('Component mounted', {
  component: 'UserProfile',
  props: { userId },
  timestamp: Date.now()
})
```

## 🔄 Deployment Workflow

### Pre-deployment Checklist
- [ ] Tests pasando
- [ ] Lint sin errores
- [ ] Build exitoso
- [ ] Migraciones de DB ejecutadas
- [ ] Variables de entorno configuradas

### Post-deployment
- [ ] Verificar funcionalidades críticas
- [ ] Revisar logs de errores
- [ ] Monitorear métricas de performance

---

**Última actualización**: 2025-08-02  
**Mantenido por**: Equipo de Desarrollo CRM