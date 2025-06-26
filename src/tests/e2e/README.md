
# Tests E2E con Playwright

## Configuración Inicial

### 1. Instalar dependencias y browsers

```bash
# La dependencia @playwright/test ya está instalada
# Ejecuta el script de configuración para instalar los browsers
node scripts/setup-playwright.js
```

### 2. Configurar usuario de test

Crea un usuario de prueba en Supabase con estas credenciales:
- **Email**: `admin@test.com`
- **Password**: `admin123`
- **Rol**: admin

### 3. Scripts disponibles

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "setup:playwright": "node scripts/setup-playwright.js"
  }
}
```

## Estructura de Tests

- `fixtures/` - Configuraciones y datos reutilizables
- `page-objects/` - Page Object Models para interacciones con páginas
- `specs/` - Tests específicos organizados por funcionalidad
- `global-setup.ts` - Configuración global antes de ejecutar tests
- `global-teardown.ts` - Limpieza global después de ejecutar tests

## Ejecución

```bash
# Configuración inicial (solo la primera vez)
npm run setup:playwright

# Ejecutar todos los tests
npm run test:e2e

# Ejecutar con interfaz gráfica
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug

# Ver reporte de resultados
npm run test:e2e:report
```

## Tests Disponibles

### Tests de Autenticación
- Login exitoso
- Login con credenciales incorrectas
- Logout exitoso

### Tests de Navegación
- Navegación principal entre secciones
- Sidebar responsive

### Tests de Dashboard
- Visualización correcta de elementos
- Navegación desde dashboard
- Funcionalidad del timer

### Tests de Contactos
- Lista de contactos
- Crear nuevo contacto
- Buscar contactos
- Filtros de contactos

## Notas Importantes

- Los tests están configurados para ejecutarse en múltiples navegadores (Chrome, Firefox, Safari)
- Incluye soporte para dispositivos móviles
- Captura automática de screenshots y videos en caso de fallos
- Trazas de ejecución para debugging
