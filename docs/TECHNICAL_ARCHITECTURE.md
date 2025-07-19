# Arquitectura Técnica del Sistema CRM Legal

## Stack Tecnológico

### Frontend
- **Framework**: React 18.3.1 con TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM 6.26.2
- **UI Library**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS con sistema de diseño personalizado
- **State Management**: React Query (TanStack Query) 5.56.2
- **Forms**: React Hook Form 7.53.0 + Zod validation

### Backend & Base de Datos
- **BaaS**: Supabase
- **Base de Datos**: PostgreSQL con Row Level Security (RLS)
- **Authentication**: Supabase Auth con OAuth
- **Storage**: Supabase Storage para archivos
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Real-time**: Supabase Realtime para actualizaciones en vivo

### Integraciones Externas
- **Email**: Outlook/Exchange integration
- **Contabilidad**: Quantum Economics API
- **AI**: OpenAI GPT-4 para asistente legal
- **PDF**: Generación automática de documentos
- **Calendar**: Sincronización con Outlook Calendar

## Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Supabase API    │◄──►│   PostgreSQL    │
│                 │    │                  │    │                 │
│ - UI Components │    │ - REST API       │    │ - 87 Tables     │
│ - React Query   │    │ - Auth           │    │ - RLS Policies  │
│ - State Mgmt    │    │ - Edge Functions │    │ - Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         │              │ External APIs    │
         │              │                  │
         └──────────────►│ - Quantum Econ   │
                        │ - OpenAI         │
                        │ - Outlook        │
                        │ - Resend Email   │
                        └──────────────────┘
```

## Estructura de Directorios

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layout/         # Layouts y estructura
│   ├── cases/          # Gestión de casos
│   ├── contacts/       # Gestión de contactos
│   ├── users/          # Gestión de usuarios
│   ├── quantum/        # Integración Quantum
│   └── ...
├── hooks/              # Custom hooks
│   ├── quantum/        # Hooks para Quantum API
│   ├── use-*/          # Hooks generales
│   └── ...
├── pages/              # Páginas principales
├── integrations/       # Configuraciones externas
│   └── supabase/       # Cliente y tipos de Supabase
├── lib/                # Utilidades y configuración
└── assets/            # Recursos estáticos
```

## Patrones de Diseño Implementados

### 1. Container/Presentational Pattern
- Separación entre lógica de negocio (hooks) y presentación (componentes)
- Hooks personalizados para gestión de estado y API calls

### 2. Provider Pattern
- Context para temas y configuración global
- Authentication context a través de Supabase

### 3. Compound Component Pattern
- Componentes complejos como TabsRoot, TabsList, TabsContent
- Formularios modulares con componentes reutilizables

### 4. Repository Pattern
- Abstracciones para acceso a datos a través de hooks
- Centralización de lógica de API en hooks específicos

## Seguridad

### Row Level Security (RLS)
- Todas las tablas protegidas por org_id
- Políticas granulares por rol de usuario
- Función `get_user_org_id()` para aislamiento de datos

### Autenticación
- JWT tokens manejados por Supabase
- OAuth con Google y Microsoft
- Multi-factor authentication opcional

### Autorización
- Sistema de roles: partner, area_manager, senior, junior, finance
- Permisos granulares por funcionalidad
- Bypass de RLS para super admins

## Performance

### Optimizaciones Frontend
- Code splitting por rutas
- Lazy loading de componentes pesados
- React Query para cache inteligente
- Memoización con useMemo y useCallback

### Optimizaciones Backend
- Índices optimizados en PostgreSQL
- Políticas RLS eficientes
- Edge Functions para operaciones pesadas
- Cache de consultas frecuentes

## Escalabilidad

### Horizontal
- Supabase maneja auto-scaling
- Edge Functions distribuidas globalmente
- CDN para assets estáticos

### Vertical
- Database connection pooling
- Optimización de queries complejas
- Batch operations para operaciones masivas

## Monitoreo y Logging

### Analytics Personalizados
- Tabla `analytics_sessions` para seguimiento de usuarios
- Tabla `analytics_events` para acciones específicas
- Tabla `analytics_errors` para debugging

### AI Usage Tracking
- Tabla `ai_usage_logs` para costos y uso de OpenAI
- Alertas automáticas por umbral de costo

### Performance Monitoring
- Tabla `analytics_performance` para métricas web vitals
- Seguimiento de carga de páginas

## Backup y Recuperación

### Estrategia de Backup
- Backups automáticos diarios de Supabase
- Point-in-time recovery hasta 7 días
- Backup de archivos en Supabase Storage

### Disaster Recovery
- Multi-region deployment capability
- Database replication automática
- Recovery procedures documentados