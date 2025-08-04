# Performance Guidelines

## 📊 Performance Budget

### Production Targets
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: < 2MB total
- **Memory Usage**: < 75MB

### Development Tolerances
- **FCP**: < 3s
- **LCP**: < 5s
- **FID**: < 300ms
- **CLS**: < 0.25
- **Bundle Size**: < 5MB
- **Memory Usage**: < 500MB

## 🚀 Optimization Strategies

### Code Splitting
```typescript
// ✅ Usar createOptimizedLazy para rutas
const Dashboard = createOptimizedLazy(
  () => import('@/pages/Dashboard'),
  RoutePriority.CRITICAL
)

// ✅ Lazy loading con prioridades
const Reports = createOptimizedLazy(
  () => import('@/pages/Reports'),
  RoutePriority.LOW
)
```

### Tree Shaking
```typescript
// ❌ Evitar imports completos
import * as Icons from 'lucide-react'

// ✅ Usar imports específicos
import { Search, User, Settings } from 'lucide-react'
```

### Memory Management
```typescript
// ✅ Limpiar timers y listeners
useEffect(() => {
  const timer = setInterval(callback, 1000)
  return () => clearInterval(timer)
}, [])

// ✅ Usar useCallback para funciones estables
const handleClick = useCallback(() => {
  // logic
}, [dependency])
```

## 📈 Monitoring

### Performance Hooks
```typescript
// Monitorear memoria por componente
useMemoryTracker('ComponentName', 5000)

// Monitorear performance budget
usePerformanceBudget({
  maxBundleSize: 2,
  maxLoadTime: 2500,
  maxMemoryUsage: 75
})
```

### Bundle Analysis
```bash
# Analizar bundle size
npm run analyze:bundle

# Auditoría completa
npm run analyze:performance
```

## ⚡ Performance Patterns

### Lazy Loading Components
```typescript
// ✅ Lazy loading con Suspense
const LazyComponent = lazy(() => import('./Component'))

// ✅ Con wrapper optimizado
<LazyRouteWrapper routeName="Component" priority="medium">
  <LazyComponent />
</LazyRouteWrapper>
```

### Resource Preloading
```typescript
// ✅ Preload recursos críticos
useResourcePreloader().preloadImages([
  '/images/logo.svg',
  '/images/hero.jpg'
])

// ✅ Preload rutas relacionadas
useCriticalRoutePreloader()
```

### Memory Optimization
```typescript
// ✅ Usar refs para valores que no causan re-render
const expensiveValue = useRef(heavyComputation())

// ✅ Memoizar computaciones pesadas
const expensiveResult = useMemo(() => 
  heavyComputation(data), [data]
)
```

## 🔍 Debugging Performance

### Chrome DevTools
1. **Performance tab**: Analizar rendering y JS execution
2. **Memory tab**: Detectar memory leaks
3. **Network tab**: Optimizar asset loading
4. **Lighthouse**: Auditoría completa

### Performance Dashboard
- Core Web Vitals en tiempo real
- Memory usage tracking
- Bundle size analysis
- Performance violations

## 📋 Performance Checklist

### Pre-Deploy
- [ ] Bundle size < 2MB
- [ ] No memory leaks detectados
- [ ] Core Web Vitals dentro del budget
- [ ] Lazy loading funcionando correctamente
- [ ] Service worker cachea recursos críticos

### Post-Deploy
- [ ] Monitor Core Web Vitals en producción
- [ ] Verificar performance en dispositivos móviles
- [ ] Analizar Real User Monitoring (RUM)
- [ ] Optimizar basado en métricas reales

## 🛠️ Tools y Scripts

### Analysis Scripts
```bash
# Bundle analysis detallado
npm run analyze:bundle

# Performance audit
npm run analyze:performance

# Memory profiling
npm run test:performance
```

### Performance Testing
```typescript
// Test de performance de componentes
it('should render within budget', async () => {
  const time = await measurePerformance(async () => {
    render(<Component />)
  })
  expect(time).toBeLessThan(16) // 60fps
})
```