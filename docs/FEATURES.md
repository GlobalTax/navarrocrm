# Feature Development Guide

## 🏗️ Feature Structure

### Standard Feature Layout
```
src/features/nueva-feature/
├── components/          # Componentes específicos
│   ├── FeatureList.tsx
│   ├── FeatureDetail.tsx
│   └── FeatureForm.tsx
├── hooks/              # Hooks de la feature
│   ├── useFeature.ts
│   └── useFeatureForm.ts
├── services/           # Servicios y API calls
│   └── featureService.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── utils/              # Utilidades específicas
│   └── featureUtils.ts
└── index.ts            # Punto de entrada
```

## 📦 Creating a New Feature

### 1. Create Feature Structure
```bash
mkdir -p src/features/nueva-feature/{components,hooks,services,types,utils}
touch src/features/nueva-feature/{index.ts,components/index.ts,hooks/index.ts}
```

### 2. Define Types
```typescript
// src/features/nueva-feature/types/index.ts
export interface FeatureItem {
  id: string
  name: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface FeatureFilters {
  status?: string
  search?: string
}
```

### 3. Create Service
```typescript
// src/features/nueva-feature/services/featureService.ts
import { supabase } from '@/integrations/supabase'
import type { FeatureItem } from '../types'

export const featureService = {
  async getAll(): Promise<FeatureItem[]> {
    const { data, error } = await supabase
      .from('features')
      .select('*')
    
    if (error) throw error
    return data
  },

  async create(item: Omit<FeatureItem, 'id' | 'created_at' | 'updated_at'>): Promise<FeatureItem> {
    const { data, error } = await supabase
      .from('features')
      .insert(item)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
```

### 4. Create Hooks
```typescript
// src/features/nueva-feature/hooks/useFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { featureService } from '../services/featureService'
import type { FeatureItem } from '../types'

export const useFeatures = () => {
  return useQuery({
    queryKey: ['features'],
    queryFn: featureService.getAll
  })
}

export const useCreateFeature = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: featureService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
    }
  })
}
```

### 5. Create Components
```typescript
// src/features/nueva-feature/components/FeatureList.tsx
import { useFeatures } from '../hooks/useFeature'

export const FeatureList = () => {
  const { data: features, isLoading } = useFeatures()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {features?.map(feature => (
        <div key={feature.id} className="border rounded p-4">
          <h3 className="font-semibold">{feature.name}</h3>
          <p className="text-sm text-muted-foreground">{feature.status}</p>
        </div>
      ))}
    </div>
  )
}
```

### 6. Export from Index
```typescript
// src/features/nueva-feature/index.ts
// Components
export { FeatureList } from './components/FeatureList'
export { FeatureDetail } from './components/FeatureDetail'

// Hooks
export { useFeatures, useCreateFeature } from './hooks/useFeature'

// Services
export { featureService } from './services/featureService'

// Types
export type { FeatureItem, FeatureFilters } from './types'
```

## 🚀 Adding to Router

### 1. Create Page Component
```typescript
// src/pages/Features.tsx
import { FeatureList } from '@/features/nueva-feature'

const FeaturesPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Features</h1>
      <FeatureList />
    </div>
  )
}

export default FeaturesPage
```

### 2. Add Lazy Route
```typescript
// src/router/routes/protectedRoutes.tsx
const Features = createOptimizedLazy(
  () => import('@/pages/Features'),
  RoutePriority.MEDIUM
)

// Add to routes array
{
  path: '/features',
  element: (
    <FeatureBoundary feature="Features">
      <Features />
    </FeatureBoundary>
  )
}
```

## 🧪 Testing the Feature

### 1. Create Test Data
```typescript
// src/test/testUtils.ts
export const createMockFeature = (overrides = {}) => ({
  id: '1',
  name: 'Test Feature',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})
```

### 2. Test the Feature
```typescript
// src/test/features/nueva-feature.test.ts
import { describe, it, expect } from 'vitest'
import { createMockFeature } from '@/test/testUtils'

describe('Nueva Feature', () => {
  it('should create mock feature data', () => {
    const feature = createMockFeature({
      name: 'Custom Feature',
      status: 'inactive'
    })
    
    expect(feature.name).toBe('Custom Feature')
    expect(feature.status).toBe('inactive')
  })
})
```

## 📋 Feature Checklist

### Development
- [ ] Feature structure created
- [ ] Types defined
- [ ] Service implemented
- [ ] Hooks created
- [ ] Components built
- [ ] Exports configured

### Integration
- [ ] Page component created
- [ ] Lazy loading configured
- [ ] Route added to router
- [ ] Navigation updated
- [ ] Error boundaries added

### Quality
- [ ] Tests implemented
- [ ] Performance tested
- [ ] Accessibility verified
- [ ] Types properly exported
- [ ] Documentation updated

## 🔧 Best Practices

### Code Organization
- ✅ Keep features independent
- ✅ Use TypeScript para type safety
- ✅ Implement proper error handling
- ✅ Follow naming conventions
- ✅ Document complex logic

### Performance
- ✅ Lazy load heavy components
- ✅ Optimize database queries
- ✅ Use React.memo when appropriate
- ✅ Implement proper caching
- ✅ Monitor memory usage

### Testing
- ✅ Unit test all hooks
- ✅ Test error scenarios
- ✅ Verify performance budgets
- ✅ Test accessibility
- ✅ Mock external dependencies

## 🚀 Advanced Patterns

### Feature Flags
```typescript
// Feature flag support
const useFeatureFlag = (flag: string) => {
  return process.env[`VITE_FEATURE_${flag}`] === 'true'
}

// Usage in component
const showNewFeature = useFeatureFlag('NEW_FEATURE')
```

### Cross-Feature Communication
```typescript
// Use context for cross-feature state
export const FeatureContext = createContext()

// Use events for loose coupling
window.dispatchEvent(new CustomEvent('feature-updated', {
  detail: { featureId, data }
}))
```