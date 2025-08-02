# 🏢 CRM Asesorías Multidisciplinares

Sistema CRM líder para asesorías, 100% cloud-native, que integra gestión de expedientes, time-tracking, facturación y portal cliente en un flujo único.

## 🎯 Objetivos OKR 2025

- **O1**: Reducir 40% el tiempo administrativo del despacho
- **O2**: Elevar un 25% las horas facturadas registradas  
- **O3**: Lograr NPS ≥ 55 en portal cliente

## ⚡ Quick Start

```bash
# Instalación
bun install

# Variables de entorno
cp .env.example .env.local
# Configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# Setup base de datos
bun run db:migrate

# Desarrollo
bun run dev
```

## 🏗 Arquitectura

### Stack Tecnológico
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth)
- **UI**: Radix UI + shadcn/ui con sistema de diseño customizado
- **Estado**: React Query + Zustand
- **Deployment**: Vercel + GitHub Actions

### Estructura del Proyecto
```
src/
├── components/     # Componentes UI reutilizables
├── features/       # Módulos funcionales encapsulados  
├── hooks/          # Hooks React customizados
├── utils/          # Utilidades y helpers
└── pages/          # Páginas principales (rutas)
```

## 🎨 Sistema de Diseño

### Principios
- **Bordes**: 0.5px solid black consistente
- **Border-radius**: 10px en todos los componentes
- **Fuente**: Manrope (Google Fonts)
- **Colores**: Tokens semánticos HSL definidos en `index.css`
- **Efectos**: hover-lift con `translateY(-2px)` y sombras

### Componentes Base
```tsx
// ✅ Uso correcto con tokens semánticos
<Button variant="primary" className="border-0.5 border-black rounded-[10px]">
  Acción Principal
</Button>

// ❌ Evitar colores directos
<Button className="bg-blue-500 text-white">
  Incorrecto
</Button>
```

## 🚀 Features Principales

### 📋 Must Have (2025)
- [x] Ficha 360º Cliente (CL-01)
- [x] Expediente maestro (CL-02)  
- [x] Timer embebido (TT-01)
- [x] Facturación recurrente (FA-02)
- [x] Portal expedientes cliente (PC-02)
- [x] Temporizador plazos legales (WF-02)

### 🎯 Should Have
- [ ] Firma e-Sign (GD-03)
- [ ] Estados de cobro + alertas impago (FA-04)
- [ ] Push a Teams / Slack (CO-02)

### 💡 Could Have
- [ ] Export JSON/CSV (BI-03)
- [ ] Presentación modelos AEAT (IN-05)

## 🔧 Desarrollo

### Comandos Principales
```bash
# Desarrollo
bun run dev

# Testing
bun run test
bun run test:watch

# Build
bun run build
bun run preview

# Linting & Format
bun run lint
bun run format

# Base de datos
bun run db:migrate
bun run db:reset
bun run db:seed
```

### Convenciones de Código

#### Logging Estructurado
```typescript
import { createLogger } from '@/utils/logging'

const logger = createLogger('ComponentName')

// ✅ Logging correcto
logger.info('Usuario creado exitosamente', {
  userId: user.id,
  orgId: user.org_id,
  action: 'user_creation'
})

// ❌ Evitar console.log
console.log('Usuario creado:', user)
```

#### Hooks Optimizados
```typescript
// ✅ Con useCallback/useMemo para performance
const handleSubmit = useCallback((data: FormData) => {
  logger.info('Formulario enviado', { formType: 'user_profile' })
  submitForm(data)
}, [submitForm])

const expensiveValue = useMemo(() => 
  calculateComplexValue(data), [data]
)
```

## 🧪 Testing

### Estrategia
- **Unit Tests**: Vitest + Testing Library
- **Integration Tests**: Playwright para E2E
- **Mocks**: Helpers centralizados en `src/utils/testing/`

```typescript
import { createTestQueryClient, mockAuthUser } from '@/utils/testing'

describe('UserProfile', () => {
  it('renders user information correctly', () => {
    render(<UserProfile user={mockAuthUser} />)
    expect(screen.getByText(mockAuthUser.email)).toBeInTheDocument()
  })
})
```

## 📊 Performance & Monitoring

### Métricas Clave
- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Memory Usage**: Monitoreado continuamente

### Logging & Debugging
```typescript
// Sistema de logging profesional con niveles
logger.debug('Información detallada para desarrollo')
logger.info('Operaciones normales del sistema')
logger.warn('Situaciones que requieren atención')
logger.error('Errores críticos que afectan funcionalidad')
```

## 🔐 Security & Compliance

### Seguridad
- **Row Level Security (RLS)** por `org_id`
- **MFA obligatoria** fuera de red corporativa
- **Cifrado AES-256-GCM** en reposo
- **Auditoría completa** de todas las operaciones

### GDPR Compliance
- **DPO**: dpo@midominio.com
- **SLA**: 30 días para Subject Access Requests
- **Retención**: Backups 5 años + PITR 1h

## 🚀 Deployment

### Environments
- **Development**: Local con Supabase local
- **Staging**: Vercel preview con Supabase staging  
- **Production**: Vercel production con Supabase production

### CI/CD Pipeline
1. **Push** → GitHub Actions
2. **Tests** automáticos
3. **Build & Deploy** a staging
4. **Manual approval** para producción
5. **Monitoring** post-deployment

## 📚 Documentación

- [Arquitectura Completa](docs/ARCHITECTURE.md)
- [Guía de Desarrollo](docs/DEVELOPMENT.md)
- [API Reference](docs/API.md)
- [Troubleshooting](https://docs.lovable.dev/tips-tricks/troubleshooting)

## 🤝 Contribución

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit con mensaje descriptivo
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Changelog

### v1.0.0 (2025-08-02)
- ✅ Arquitectura feature-based implementada
- ✅ Sistema de logging centralizado
- ✅ Componentes modularizados (Users, Proposals)
- ✅ Performance monitoring
- ✅ Testing infrastructure
- ✅ Documentación completa

---

**Mantenido por**: Equipo de Desarrollo CRM  
**Licencia**: Propietaria  
**Contacto**: dev@midominio.com