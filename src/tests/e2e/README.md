
# Tests E2E con Playwright

## Instalación

Para usar estos tests, primero necesitas instalar Playwright:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

## Scripts recomendados para package.json

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:install": "playwright install"
  }
}
```

## Estructura de Tests

- `fixtures/` - Configuraciones y datos reutilizables
- `page-objects/` - Page Object Models para interacciones con páginas
- `specs/` - Tests específicos organizados por funcionalidad
- `global-setup.ts` - Configuración global antes de ejecutar tests
- `global-teardown.ts` - Limpieza global después de ejecutar tests

## Usuario de Test

Para los tests, necesitas crear un usuario de prueba en Supabase:
- Email: `admin@test.com`
- Password: `admin123`
- Rol: admin

## Ejecución

```bash
npm run test:e2e          # Ejecutar todos los tests
npm run test:e2e:ui       # Ejecutar con interfaz gráfica
npm run test:e2e:debug    # Ejecutar en modo debug
npm run test:e2e:report   # Ver reporte de resultados
```
