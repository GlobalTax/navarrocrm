# Sistema de Logging Profesional

Sistema centralizado de logging que reemplaza todos los `console.log` dispersos en la aplicación.

## Características

- ✅ **Contextual**: 20+ loggers especializados por módulo
- ✅ **Inteligente**: Solo activo en desarrollo, silencioso en producción
- ✅ **Robusto**: Tipos TypeScript completos y validación
- ✅ **Escalable**: Preparado para servicios de monitoreo externos
- ✅ **Eficiente**: Limpieza automática y gestión de memoria

## Uso Básico

```typescript
import { authLogger, proposalsLogger, globalLogger } from '@/utils/logging'

// Logger contextual específico
authLogger.info('Usuario autenticado exitosamente', { userId: '123' })
proposalsLogger.error('Error creando propuesta', { error: error.message })

// Logger global para casos generales
globalLogger.debug('Operación completada', { duration: '250ms' })
```

## Loggers Disponibles

### Módulos de Negocio
- `authLogger` - Autenticación y autorización
- `proposalsLogger` - Gestión de propuestas
- `contactsLogger` - Gestión de contactos
- `casesLogger` - Gestión de expedientes
- `documentsLogger` - Generación y gestión de documentos
- `invoicesLogger` - Facturación y pagos
- `tasksLogger` - Gestión de tareas
- `recurringFeesLogger` - Cuotas recurrentes

### Módulos Técnicos
- `appLogger` - Aplicación general
- `routeLogger` - Navegación y rutas
- `aiLogger` - Inteligencia artificial
- `bulkUploadLogger` - Carga masiva de datos
- `performanceLogger` - Optimización y rendimiento
- `workflowLogger` - Flujos de trabajo
- `globalLogger` - Casos generales

### Módulos de Sistema
- `setupLogger` - Configuración inicial
- `profileLogger` - Perfiles de usuario
- `sessionLogger` - Gestión de sesiones

## Niveles de Log

```typescript
logger.debug('Información detallada para debugging')
logger.info('Información general del flujo')
logger.warn('Advertencias que requieren atención')
logger.error('Errores que requieren intervención')
```

## Configuración

El sistema se configura automáticamente:
- **Desarrollo**: Todos los logs activos con emojis y timestamps
- **Producción**: Solo errores críticos, enviados a monitoreo

## Migración desde Sistema Legacy

### Antes (❌)
```typescript
import { logger } from '@/utils/logger'
import { useLogger } from '@/hooks/useLogger'

console.log('🔐 Usuario autenticado:', userId)
logger.info('Operación completada')
```

### Después (✅)
```typescript
import { authLogger, globalLogger } from '@/utils/logging'

authLogger.info('Usuario autenticado', { userId })
globalLogger.info('Operación completada')
```

## Beneficios

1. **Sin Console.logs en Producción**: Performance mejorada
2. **Debugging Inteligente**: Contexto específico por módulo
3. **Monitoreo Preparado**: Integración lista para Sentry/LogRocket
4. **Type Safety**: TypeScript completo con validación
5. **Gestión Automática**: Limpieza de memoria y rotación de logs

## Estructura de Archivos

```
src/utils/logging/
├── index.ts              # Exportaciones principales
├── types.ts              # Tipos y interfaces
├── logger.ts             # Logger principal
├── context-loggers.ts    # Loggers especializados
└── README.md             # Documentación (este archivo)
```

## Roadmap

- [ ] Integración con Sentry para errores en producción
- [ ] Dashboard de logs en tiempo real
- [ ] Métricas y analytics automáticos
- [ ] Export/import de logs para debugging
- [ ] Filtros avanzados por contexto y nivel