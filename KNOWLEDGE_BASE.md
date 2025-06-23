
# 📋 Base de Conocimiento - CRM Legal Asesorías

## 📌 1. Descripción General del Proyecto

### Visión
Construir el CRM líder para asesorías multidisciplinares, 100% cloud-native, que integre gestión de expedientes, time-tracking, facturación y portal cliente en un flujo único.

### Objetivos OKR 2025
- **O1**: Reducir 40% el tiempo administrativo del despacho
- **O2**: Elevar un 25% las horas facturadas registradas  
- **O3**: Lograr NPS ≥ 55 en portal cliente

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticación**: Supabase Auth + OAuth (Google/MS)
- **Estado**: TanStack Query + React Hooks
- **Routing**: React Router DOM
- **Deployment**: Vercel + Supabase

---

## 👥 2. Personas de Usuario y Roles

| Rol | Responsabilidades | Permisos | Necesidades Clave |
|-----|------------------|----------|-------------------|
| **Partner** | Dirección estratégica, aprobación facturas >10k€ | Acceso total, bypass RLS | Dashboard ejecutivo, KPIs, control financiero |
| **Area Manager** | Supervisión equipos, asignación casos | Gestión equipos, validación horas | Workflow management, métricas equipo |
| **Senior** | Ejecución casos complejos, mentoría | Gestión casos asignados, creación tareas | Herramientas avanzadas, comunicación cliente |
| **Junior** | Ejecución tareas, registro tiempo | Casos asignados, time tracking | Interface simple, tracking claro |
| **Finance** | Facturación, pagos, reconciliación | Módulo financiero completo | Automatización facturación, reporting |
| **Client** | Seguimiento casos propios | Portal cliente (solo casos propios) | Transparencia, comunicación, documentos |

---

## 🎨 3. Estándares UI/UX

### **Principios de Diseño Fundamentales**

#### **Sin Iconos en la Aplicación**
- **Regla absoluta**: No usar iconos en ninguna parte de la interfaz
- **Razón**: Mantener consistencia visual y evitar sobrecarga cognitiva
- **Aplicación**: Headers, botones, navegación, acciones rápidas
- **Excepción**: Solo iconos del sistema (cerrar ventanas, minimizar) están permitidos

#### **Tipografía Unificada**
```typescript
// Títulos principales de página
className="text-xl font-semibold text-gray-900"

// Descripciones de página
className="text-sm text-gray-600"

// Títulos de sección
className="text-lg font-medium text-gray-900"

// Texto body estándar
className="text-sm text-gray-700"
```

#### **Espaciado Consistente**
- **Entre secciones principales**: `space-y-6`
- **Entre elementos relacionados**: `space-y-4`
- **Entre elementos muy cercanos**: `space-y-2`
- **Padding interno de cards**: `p-6`

### **Componentes Estándar Obligatorios**

#### **StandardPageHeader**
```typescript
// USO CORRECTO
<StandardPageHeader
  title="Título de la Página"
  description="Descripción opcional"
  primaryAction={{
    label: "Acción Principal",
    onClick: handleAction
  }}
  badges={[
    {
      label: "Estado",
      variant: 'outline',
      color: 'text-blue-600 border-blue-200 bg-blue-50'
    }
  ]}
/>

// USO INCORRECTO - NO hacer esto
<div className="flex justify-between">
  <h1>Título</h1>
  <Button>Acción</Button>
</div>
```

#### **StandardPageContainer**
```typescript
// USO CORRECTO - Envolver TODA la página
<StandardPageContainer>
  <StandardPageHeader {...headerProps} />
  <ComponentePrincipal />
  <OtroComponente />
</StandardPageContainer>

// USO INCORRECTO - No usar divs genéricos
<div className="space-y-6">
  {/* contenido */}
</div>
```

#### **StandardFilters**
```typescript
// USO CORRECTO para sistemas de filtrado
<StandardFilters
  searchPlaceholder="Buscar clientes..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  filters={[
    {
      placeholder: "Estado",
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions
    }
  ]}
  onClearFilters={handleClearFilters}
  hasActiveFilters={hasActiveFilters}
/>
```

### **Patrones de Layout Estándar**

#### **Estructura de Página Típica**
```typescript
export default function MiPagina() {
  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Título Principal"
        description="Descripción de la funcionalidad"
        primaryAction={{
          label: "Nueva Acción",
          onClick: handleNewAction
        }}
      />
      
      <StandardFilters
        searchValue={search}
        onSearchChange={setSearch}
        filters={filtros}
      />
      
      <ComponentePrincipal />
    </StandardPageContainer>
  )
}
```

#### **Grid Layouts Responsivos**
```typescript
// Para dashboards y métricas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Para formularios
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Para listas con sidebar
<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
  <div className="xl:col-span-1">Sidebar</div>
  <div className="xl:col-span-3">Contenido</div>
</div>
```

### **Patrones de Colores Consistentes**

#### **Sistema de Badges**
```typescript
// Estados principales
{ color: 'text-blue-600 border-blue-200 bg-blue-50' }    // Info/Activo
{ color: 'text-green-600 border-green-200 bg-green-50' }  // Éxito/Completado
{ color: 'text-yellow-600 border-yellow-200 bg-yellow-50' } // Advertencia/Pendiente
{ color: 'text-red-600 border-red-200 bg-red-50' }       // Error/Urgente
{ color: 'text-gray-600 border-gray-200 bg-gray-50' }    // Neutral/Inactivo
```

#### **Botones Estándar**
```typescript
// Acción principal
<Button variant="default">Acción Principal</Button>

// Acción secundaria
<Button variant="outline">Acción Secundaria</Button>

// Acción destructiva
<Button variant="destructive">Eliminar</Button>

// Acción sutil
<Button variant="ghost">Cancelar</Button>
```

### **Guías de Implementación**

#### **✅ Hacer**
- Usar `StandardPageHeader` en TODAS las páginas
- Envolver contenido en `StandardPageContainer`
- Aplicar `space-y-6` entre secciones principales
- Usar el sistema de badges consistente
- Mantener tipografía unificada
- Implementar responsive design con grid system

#### **❌ No Hacer**
- Usar iconos en ninguna parte
- Crear headers personalizados con divs
- Mezclar diferentes espaciados
- Usar colores fuera del sistema establecido
- Crear botones con estilos personalizados
- Romper la jerarquía visual establecida

### **Checklist de Revisión UI/UX**

#### **Antes de Publicar Cualquier Feature**
- [ ] ¿Usa `StandardPageHeader` para el header?
- [ ] ¿Está envuelto en `StandardPageContainer`?
- [ ] ¿No hay iconos en ninguna parte?
- [ ] ¿La tipografía sigue los estándares (`text-xl`, `text-sm`)?
- [ ] ¿El espaciado usa `space-y-6` entre secciones?
- [ ] ¿Los badges usan el sistema de colores estándar?
- [ ] ¿Los botones usan variants estándar?
- [ ] ¿Es responsive con el grid system?
- [ ] ¿Los filtros usan `StandardFilters`?
- [ ] ¿La navegación es consistente con el resto?

### **Ejemplos de Implementación Correcta**

#### **Dashboard Page**
```typescript
<StandardPageContainer>
  <StandardPageHeader
    title={`Bienvenido, ${userName}`}
    description="Resumen ejecutivo de tu despacho"
    badges={[{ 
      label: `Rol: ${user.role}`, 
      variant: 'outline',
      color: 'text-blue-600 border-blue-200 bg-blue-50'
    }]}
  />
  <DashboardMetrics />
  <DashboardLayout />
</StandardPageContainer>
```

#### **Lista con Filtros**
```typescript
<StandardPageContainer>
  <StandardPageHeader
    title="Gestión de Clientes"
    description="Administra la información de tus clientes"
    primaryAction={{
      label: "Nuevo Cliente",
      onClick: handleNewClient
    }}
  />
  
  <StandardFilters
    searchPlaceholder="Buscar clientes..."
    searchValue={searchTerm}
    onSearchChange={setSearchTerm}
    filters={clientFilters}
  />
  
  <ClientsList />
</StandardPageContainer>
```

---

## 🏗 4. Arquitectura del Sistema

### Estructura de Carpetas
```
src/
├── components/           # Componentes UI reutilizables
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (StandardPageHeader, etc.)
│   ├── cases/           # Componentes específicos de casos
│   ├── clients/         # Componentes de clientes
│   ├── proposals/       # Sistema de propuestas
│   ├── workflows/       # Automatizaciones
│   └── ai/              # Componentes de IA
├── hooks/               # Custom hooks
│   ├── cases/           # Hooks específicos de casos
│   ├── proposals/       # Hooks de propuestas
│   └── workflows/       # Hooks de workflows
├── pages/               # Páginas principales
├── contexts/            # Context providers
├── types/               # Definiciones TypeScript
└── integrations/        # Integraciones externas
```

### Patrones de Diseño
- **Container/Presentational**: Separación lógica/UI
- **Custom Hooks**: Lógica reutilizable
- **Compound Components**: Componentes complejos modulares
- **Context + Hooks**: Estado global
- **Query Patterns**: TanStack Query para data fetching

---

## 🗄 5. Esquema de Base de Datos

### Entidades Principales

#### **Organizations** (Multi-tenancy)
```sql
organizations {
  id: uuid (PK)
  name: varchar
  created_at, updated_at: timestamp
}
```

#### **Users & Roles**
```sql
users {
  id: uuid (PK, FK -> auth.users)
  org_id: uuid (FK -> organizations)
  email: varchar
  role: varchar (partner|area_manager|senior|junior|finance|client)
}

user_roles {
  id: uuid (PK)
  user_id: uuid (FK -> auth.users)
  role: app_role (super_admin|admin|manager|senior|junior|finance)
  org_id: uuid (FK -> organizations)
}
```

#### **Clients**
```sql
clients {
  id: uuid (PK)
  org_id: uuid (FK -> organizations)
  name: varchar
  email: varchar
  client_type: varchar (particular|empresa)
  dni_nif: varchar
  address_*: varchar
  contact_preference: varchar
  tags: text[]
  status: varchar (activo|inactivo)
  hourly_rate: numeric
  # ... más campos de contacto y preferencias
}
```

#### **Cases** (Expedientes)
```sql
cases {
  id: uuid (PK)
  org_id: uuid (FK -> organizations)
  client_id: uuid (FK -> clients)
  matter_number: varchar (auto-generated)
  title: varchar
  description: text
  status: varchar (open|in_progress|closed|archived)
  practice_area: varchar
  billing_method: varchar (hourly|fixed|retainer)
  responsible_solicitor_id: uuid (FK -> users)
  date_opened, date_closed: date
  estimated_budget: numeric
}
```

#### **Proposals** (Sistema de Propuestas)
```sql
proposals {
  id: uuid (PK)
  org_id: uuid (FK -> organizations)
  client_id: uuid (FK -> clients)
  proposal_number: varchar (auto-generated)
  title: varchar
  status: varchar (draft|sent|won|lost|expired)
  total_amount: numeric
  is_recurring: boolean
  recurring_frequency: varchar (monthly|quarterly|yearly)
  retainer_amount: numeric
  included_hours: integer
  contract_start_date, contract_end_date: date
  # ... campos de facturación recurrente
}

proposal_line_items {
  id: uuid (PK)
  proposal_id: uuid (FK -> proposals)
  name: varchar
  quantity: numeric
  unit_price: numeric
  total_price: numeric
}
```

#### **Recurring Fees** (Facturación Recurrente)
```sql
recurring_fees {
  id: uuid (PK)
  org_id: uuid (FK -> organizations)
  client_id: uuid (FK -> clients)
  proposal_id: uuid (FK -> proposals)
  name: varchar
  amount: numeric
  frequency: varchar (monthly|quarterly|yearly)
  start_date, end_date: date
  next_billing_date: date
  included_hours: integer
  hourly_rate_extra: numeric
  status: varchar (active|paused|cancelled)
  auto_invoice: boolean
}
```

#### **Tasks & Time Tracking**
```sql
tasks {
  id: uuid (PK)
  org_id: uuid (FK -> organizations)
  case_id: uuid (FK -> cases)
  title: varchar
  status: task_status (pending|in_progress|completed)
  priority: task_priority (low|medium|high|urgent)
  due_date: timestamp
  assigned_to: uuid (FK -> users)
  estimated_hours, actual_hours: integer
}

time_entries {
  id: uuid (PK)
  org_id: uuid (FK -> organizations)
  user_id: uuid (FK -> users)
  case_id: uuid (FK -> cases)
  duration_minutes: integer
  description: text
  is_billable: boolean
}
```

### Funciones de Base de Datos Especializadas

#### Generadores Automáticos
- `generate_matter_number(org_uuid)`: Genera números de expediente YYYY-NNNN
- `generate_proposal_number(org_uuid)`: Genera números de propuesta PROP-YYYY-NNNN

#### Calculadoras de Métricas
- `calculate_revenue_metrics(org_uuid, target_date)`: Métricas de ingresos mensuales
- `calculate_recurring_revenue_metrics(org_uuid, target_date)`: MRR/ARR
- `get_task_stats(org_uuid)`: Estadísticas de tareas por organización

#### Automatización Facturación
- `calculate_next_billing_date(input_date, frequency, billing_day)`: Próxima fecha de facturación
- `generate_recurring_invoices()`: Generación automática de facturas recurrentes
- `update_recurring_fee_hours()`: Actualización de horas utilizadas

---

## 🚀 6. Funcionalidades por Módulo

### **Dashboard Principal**
- **Métricas en tiempo real**: Casos activos, tareas pendientes, ingresos
- **Actividad reciente**: Últimas acciones del usuario
- **Agenda del día**: Calendario integrado con Outlook
- **Quick Actions**: Acceso rápido a funciones principales
- **Timer integrado**: Control de tiempo embebido

### **Gestión de Clientes**
- **CRUD completo** con validación de datos
- **Lookup NIF/CIF** integrado con Einforma
- **Sistema de notas** privadas y compartidas
- **Gestión de documentos** con categorización
- **Historial de comunicaciones**
- **Preferencias de contacto** y notificaciones
- **Métricas por cliente**: Facturación, horas, casos

### **Expedientes (Cases)**
- **Templates personalizables** por área de práctica
- **Wizard de creación** paso a paso
- **Etapas configurables** con seguimiento automático
- **Asignación de equipos** y permisos granulares
- **Integración con facturación** (hourly/fixed/retainer)
- **Comunicación automática** con clientes
- **Gestión de plazos legales**

### **Sistema de Propuestas (Multi-tier)**
1. **Propuesta Rápida**: Formulario básico para casos simples
2. **Propuesta Avanzada**: Builder con pricing tiers personalizados
3. **Propuesta Profesional**: Sistema completo con fases y equipos
4. **Propuesta Ejecutiva**: Máximo nivel de personalización

**Características Avanzadas**:
- **Line items dinámicos** con catálogo de servicios
- **Pricing tiers** configurables
- **Preview en tiempo real** con templates
- **Conversión automática** a contratos recurrentes
- **Seguimiento de estados** (draft→sent→won/lost)

### **Facturación Recurrente**
- **Contratos automáticos** desde propuestas aceptadas
- **Seguimiento de horas incluidas** vs utilizadas
- **Facturación automática** basada en calendario
- **Gestión de extras** con tarifas diferenciadas
- **Métricas MRR/ARR** en tiempo real
- **Notificaciones automáticas** de vencimientos

### **Workflows y Automatización**
- **Builder visual** de workflows
- **Triggers configurables**: caso creado, cliente agregado, tarea vencida
- **Acciones automáticas**: crear tareas, enviar emails, notificaciones
- **Templates predefinidos** por área de práctica
- **Métricas de ejecución** y optimización

### **IA Avanzada**
- **Asistente conversacional** integrado
- **Análisis de documentos** con OCR
- **Optimización de agenda** basada en IA
- **Compliance checker** automático
- **Business Intelligence** predictivo
- **Sugerencias contextuales**

### **Integraciones**
- **Microsoft Outlook**: Calendario bidireccional, emails
- **Google Workspace**: Gmail, Calendar
- **Firma electrónica**: Adobe Sign
- **ERP**: Sage (planificado)
- **Automatización**: Make.com webhooks

---

## 🔄 7. Flujos de Usuario Principales

### **Onboarding Organizacional**
1. **Setup inicial**: Creación de organización
2. **Configuración de usuarios** y roles
3. **Importación de datos** (clientes, casos existentes)
4. **Configuración de integraciones**
5. **Training del equipo** con Academia integrada

### **Flujo Comercial Principal**
```
Lead → Cliente → Propuesta → Negociación → Contrato → Facturación Recurrente
```

#### Detalle del Flujo:
1. **Captación**: Lead entra por formulario/referencia
2. **Cualificación**: Primera reunión, análisis de necesidades
3. **Propuesta**: Creación con builder apropiado según complejidad
4. **Seguimiento**: Estados automáticos, recordatorios
5. **Cierre**: Aceptación → Conversión automática a recurring fee
6. **Entrega**: Setup de caso, asignación de equipo
7. **Facturación**: Ciclo automático según frecuencia acordada

### **Gestión Diaria de Casos**
1. **Dashboard matutino**: Revisión de tareas y calendario
2. **Trabajo en casos**: Time tracking automático
3. **Comunicación cliente**: Updates automáticos
4. **Documentación**: Notas y documentos centralizados
5. **Cierre diario**: Revisión de horas y pendientes

### **Proceso de Facturación Recurrente**
1. **Cálculo automático**: Horas base + extras
2. **Generación de factura**: Templates personalizados
3. **Envío automático**: Email + portal cliente
4. **Seguimiento pagos**: Recordatorios escalonados
5. **Reconciliación**: Integración con contabilidad

---

## ⚙️ 8. Configuración Técnica

### **Autenticación y Seguridad**
- **Supabase Auth** con email/password + OAuth
- **Row Level Security (RLS)** por organización
- **Roles granulares** con permisos específicos
- **Tokens encriptados** para integraciones
- **Audit log** completo de todas las acciones

### **Base de Datos y Performance**
- **PostgreSQL** con extensiones específicas
- **Índices optimizados** para consultas frecuentes
- **Triggers automáticos** para actualizaciones
- **Backups automáticos** con retención 5 años
- **PITR** (Point-in-Time Recovery) cada hora

### **Edge Functions**
```
supabase/functions/
├── ai-assistant/          # Asistente IA con OpenAI
├── company-lookup-einforma/ # Validación NIF/CIF
├── email-webhook/         # Procesamiento emails
├── outlook-auth/          # OAuth Outlook
├── send-email/           # Templates de email
└── sync-calendar/        # Sincronización calendario
```

### **Variables de Entorno y Secretos**
- `OPENAI_API_KEY`: Para funcionalidades de IA
- `EINFORMA_CLIENT_ID/SECRET`: Validación datos empresariales
- `OUTLOOK_*`: Integración con Microsoft Graph API

### **Deployment**
- **Frontend**: Vercel con preview automático
- **Backend**: Supabase con edge functions
- **CI/CD**: GitHub Actions
- **Monitoring**: Supabase metrics + alertas personalizadas

---

## 🛠 9. Guías de Desarrollo

### **Convenciones de Código**

#### Estructura de Hooks
```typescript
// hooks/[module]/use[Module][Action].ts
export const useProposalsFilters = () => {
  const [filters, setFilters] = useState<FilterType>({})
  
  const filterFunction = useCallback((data) => {
    // lógica de filtrado
  }, [filters])
  
  return { filters, setFilters, filterFunction }
}
```

#### Estructura de Componentes
```typescript
// components/[module]/[Component].tsx
interface ComponentProps {
  // props tipadas
}

export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // lógica del componente
  
  return (
    <div>
      {/* JSX limpio y legible */}
    </div>
  )
}
```

### **Patrones de Refactoring**

#### Antes del Refactoring
```typescript
// Componente monolítico de 200+ líneas
export default function LargeComponent() {
  // múltiples responsabilidades mezcladas
}
```

#### Después del Refactoring
```typescript
// Componente principal simplificado
export default function Component() {
  const state = useComponentState()
  const handlers = useComponentHandlers()
  
  return (
    <ComponentLayout>
      <ComponentHeader {...headerProps} />
      <ComponentContent {...contentProps} />
    </ComponentLayout>
  )
}
```

### **Testing Strategy**
- **Unit Tests**: Hooks y funciones utilitarias
- **Integration Tests**: Flujos de usuario completos
- **E2E Tests**: Casos críticos de negocio
- **Performance Tests**: Componentes con grandes datasets

### **Performance Optimizations**
- **React.memo** para componentes pesados
- **useMemo/useCallback** para cálculos complejos
- **Lazy loading** para rutas y componentes
- **Virtualization** para listas grandes
- **Query optimization** con TanStack Query

---

## 🎓 10. Sistema Academia

### **Estructura de Contenido**
```typescript
interface AcademiaContent {
  categories: AcademiaCategory[]
  topics: AcademiaTopic[]
  progress: UserProgress
}

interface AcademiaCategory {
  id: string
  name: string
  description: string
  icon: LucideIcon
  topics: AcademiaTopic[]
}
```

### **Categorías Principales**
1. **Primeros Pasos**: Onboarding y configuración inicial
2. **Gestión de Clientes**: CRUD, comunicación, documentos
3. **Expedientes**: Creación, seguimiento, facturación
4. **Propuestas Comerciales**: Todos los builders y procesos
5. **Facturación Recurrente**: Setup y gestión automatizada
6. **Automatizaciones**: Workflows y reglas de negocio
7. **Integraciones**: Outlook, calendarios, third-parties
8. **IA y Analytics**: Herramientas avanzadas
9. **Administración**: Usuarios, permisos, configuración

### **Sistema de Progreso**
- **Tracking individual** por usuario
- **Certificaciones** por módulo completado
- **Badges** por logros específicos
- **Leaderboard** organizacional (opcional)

---

## 🔒 11. Seguridad y Compliance

### **Row Level Security (RLS) Policies**
```sql
-- Ejemplo: Acceso a clientes por organización
CREATE POLICY "org_isolation_clients" 
ON clients FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Ejemplo: Partners pueden ver todo
CREATE POLICY "partners_full_access" 
ON clients FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'partner'
  )
);
```

### **Manejo de Datos Sensibles**
- **Encriptación en reposo**: AES-256-GCM
- **Tokens OAuth encriptados**: Almacenamiento seguro
- **Audit trail completo**: Todas las acciones registradas
- **GDPR compliance**: Right to be forgotten implementado
- **Data retention**: Políticas configurables por organización

### **Integraciones Seguras**
- **OAuth 2.0** para todas las integraciones
- **API Keys** almacenadas en Supabase Vault
- **Rate limiting** en edge functions
- **CORS** configurado restrictivamente
- **Input validation** en todos los endpoints

---

## 📊 12. KPIs y Métricas

### **Métricas de Negocio**
- **MRR/ARR**: Monthly/Annual Recurring Revenue
- **Churn Rate**: Tasa de cancelación de clientes
- **Customer Lifetime Value (CLV)**
- **Average Deal Size**: Tamaño promedio de propuestas
- **Conversion Rate**: Propuestas → Contratos
- **Utilization Rate**: Horas facturables / horas totales

### **Métricas Operacionales**
- **Time to Close**: Tiempo promedio cierre de casos
- **Client Satisfaction (CSAT)**: Encuestas post-caso
- **Task Completion Rate**: % tareas completadas a tiempo
- **Email Response Time**: Tiempo respuesta a clientes
- **Document Processing Time**: Eficiencia administrativa

### **Métricas Técnicas**
- **Page Load Time**: Performance frontend
- **API Response Time**: Latencia backend
- **Error Rate**: Errores por funcionalidad
- **User Adoption**: Uso de features por usuario
- **Integration Uptime**: Disponibilidad integraciones

---

## 🚀 13. Roadmap y Evolución

### **Q1 2025 - Consolidación**
- [ ] Optimización performance Dashboard
- [ ] Mejoras UX basadas en feedback
- [ ] Integración ERP Sage
- [ ] Mobile-responsive completo

### **Q2 2025 - Expansión IA**
- [ ] OCR avanzado para documentos legales
- [ ] Predictive analytics para casos
- [ ] Chatbot cliente 24/7
- [ ] Summarización automática de reuniones

### **Q3 2025 - Marketplace**
- [ ] Plugin system para desarrolladores
- [ ] Marketplace de workflows
- [ ] Integraciones adicionales (QuickBooks, etc.)
- [ ] White-label solution

### **Q4 2025 - Enterprise**
- [ ] Multi-jurisdiction support
- [ ] Advanced compliance tools
- [ ] Enterprise SSO (SAML)
- [ ] Custom reporting engine

---

## 🎯 14. Casos de Uso Específicos

### **Despacho Pequeño (2-5 abogados)**
- **Prioridad**: Simplicidad y automatización
- **Funciones clave**: Time tracking, propuestas rápidas, facturación automática
- **Métricas principales**: Horas facturadas, ingresos mensuales

### **Despacho Mediano (5-20 abogados)**
- **Prioridad**: Coordinación y especialización
- **Funciones clave**: Workflows, asignaciones, métricas por área
- **Métricas principales**: Utilización por abogado, rentabilidad por área

### **Despacho Grande (20+ abogados)**
- **Prioridad**: Governance y compliance
- **Funciones clave**: Roles granulares, audit completo, BI avanzado
- **Métricas principales**: ROI por cliente, predictive analytics

---

## 🔧 15. Troubleshooting y FAQ

### **Problemas Comunes**

#### "No veo mis datos"
- **Causa**: RLS policies o problemas de autenticación
- **Solución**: Verificar org_id del usuario y políticas de seguridad

#### "Las integraciones no funcionan"
- **Causa**: Tokens expirados o configuración incorrecta
- **Solución**: Renovar tokens OAuth y verificar permisos

#### "La facturación recurrente no se genera"
- **Causa**: Fechas incorrectas o configuración de auto_invoice
- **Solución**: Verificar next_billing_date y flags de automatización

### **Performance Issues**
- **Consultas lentas**: Revisar índices de base de datos
- **UI sluggish**: Implementar React.memo y optimizaciones
- **Memory leaks**: Cleanup de useEffect y subscriptions

---

## 📞 16. Contactos y Recursos

### **Equipo de Desarrollo**
- **Project Lead**: [Nombre]
- **Frontend Lead**: [Nombre] 
- **Backend Lead**: [Nombre]
- **DevOps**: [Nombre]

### **Enlaces Útiles**
- **Repositorio**: [GitHub URL]
- **Supabase Dashboard**: [Supabase URL]
- **Design System**: [Figma URL]
- **API Documentation**: [Docs URL]

### **Entornos**
- **Desarrollo**: [Dev URL]
- **Staging**: [Staging URL]  
- **Producción**: [Prod URL]

---

**Última actualización**: 23 de Junio, 2025
**Versión**: 2.0
**Mantenido por**: Equipo de Desarrollo CRM Legal
