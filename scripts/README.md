# 🛠️ Scripts de Desarrollo Inteligente

## 🧹 Script de Limpieza de Console.logs

## Características

- ✅ **Preserva console.error y console.warn** críticos
- 🗑️ **Elimina solo console.log de debugging**
- 💾 **Crea backups automáticamente**
- 🔍 **Modo preview (dry-run)** antes de ejecutar
- ⚙️ **Configuración personalizable**
- 🛡️ **Validación de sintaxis** básica
- 📊 **Reportes detallados** de cambios

## Uso Rápido

```bash
# Preview de cambios (recomendado primero)
npm run clean:console:preview

# Ejecutar limpieza
npm run clean:console

# Limpieza sin backup (no recomendado)
npm run clean:console:no-backup
```

## Uso Avanzado

```bash
# Modo dry-run (solo mostrar cambios)
node scripts/clean-console-logs.js --dry-run

# Sin crear backups
node scripts/clean-console-logs.js --no-backup

# Modo no interactivo
node scripts/clean-console-logs.js --no-interactive

# Directorio específico
node scripts/clean-console-logs.js --target=./src/components

# Combinado
node scripts/clean-console-logs.js --dry-run --target=./src/hooks
```

## Configuración

Edita `scripts/clean-config.json` para personalizar:

```json
{
  "preserveTypes": ["error", "warn"],    // Tipos a preservar
  "removeTypes": ["log", "info", "debug"], // Tipos a eliminar
  "excludeDirs": ["node_modules", "dist"], // Directorios a excluir
  "excludeFiles": ["*.test.*", "*.spec.*"] // Archivos a excluir
}
```

## ¿Qué hace exactamente?

### ✅ Preserva
- `console.error()` - Para manejo de errores
- `console.warn()` - Para advertencias importantes
- Console.logs en comentarios o strings
- Archivos de test y configuración

### 🗑️ Elimina
- `console.log()` - Debugging temporal
- `console.info()` - Información de debugging
- `console.debug()` - Debug verbose

### 🛡️ Seguridad
- Crea backup automático antes de modificar
- Validación básica de sintaxis
- Modo preview para verificar cambios
- Manejo de errores robusto

## Ejemplo de Output

```
🧹 Iniciando limpieza inteligente de console.logs...

⚙️  Configuración:
   📁 Directorio: ./src
   🗑️  Eliminar: console.log, console.info
   ✅ Preservar: console.error, console.warn
   💾 Backup: Sí

📋 PREVIEW DE CAMBIOS:

📁 src/components/proposals/ProposalsPageLogic.tsx
   🗑️  Eliminar: 2 console.log(s)
   ✅ Preservar: 0 console.error/warn(s)
   📍 Líneas afectadas:
      Línea 19: console.log(...)
      Línea 70: console.log(...)

¿Proceder con la limpieza? (y/N): y

📊 REPORTE DE LIMPIEZA:
📂 Archivos procesados: 45
✏️  Archivos modificados: 8
🗑️  Console.logs eliminados: 23
✅ Console.errors/warns preservados: 5
💾 Se crearon backups para archivos modificados

🎉 Limpieza completada exitosamente!
```

## Recuperar Cambios

Si algo sale mal, los backups se crean automáticamente:

```bash
# Encontrar backups
find . -name "*.backup.*" -type f

# Restaurar un archivo específico
cp src/components/MyComponent.tsx.backup.1672531200000 src/components/MyComponent.tsx
```

## Integración con Git

```bash
# Revisar cambios antes de commit
npm run clean:console:preview

# Limpiar antes de commit
npm run clean:console

# Agregar al pre-commit hook
echo "npm run clean:console:preview" >> .git/hooks/pre-commit
```

---

# 🔍 Script de Detección Inteligente de TODOs

## Características

- ✅ **Detección avanzada** de múltiples patrones TODO/FIXME/BUG
- 🎯 **Categorización por prioridad** (crítico, alto, normal, bajo)
- 👤 **Detección de asignaciones** a usuarios
- 📅 **Reconocimiento de fechas** en TODOs
- 📊 **Estadísticas detalladas** por tipo y archivo
- 📋 **Múltiples formatos** de salida (consola, JSON, Markdown)
- ⚙️ **Agrupación flexible** por archivo, tipo o prioridad

## Uso Rápido

```bash
# Buscar todos los TODOs
npm run find:todos

# Agrupar por prioridad
npm run find:todos:priority

# Generar reporte JSON
npm run find:todos:json

# Generar reporte Markdown
npm run find:todos:markdown
```

## Patrones Detectados

El script reconoce múltiples formatos de TODOs:

```javascript
// TODO: Implementar validación
// FIXME: Error en el cálculo
// BUG: No funciona en Safari
// HACK: Solución temporal
// TODO(juan): Revisar antes del lunes
// TODO 2024-07-15: Actualizar después de la migración
// FIXME HIGH: Crítico para producción
```

## Uso Avanzado

```bash
# Solo mostrar TODOs críticos
node scripts/find-todos.js --group-by=priority

# Generar reporte JSON en archivo específico
node scripts/find-todos.js --json --output=mi-reporte.json

# Buscar en directorio específico
node scripts/find-todos.js --target=./src/components

# Modo no interactivo (para CI/CD)
node scripts/find-todos.js --no-interactive

# Sin estadísticas
node scripts/find-todos.js --no-stats
```

## Niveles de Prioridad

| Palabra Clave | Prioridad | Emoji | Descripción |
|---------------|-----------|-------|-------------|
| FIXME, BUG    | Crítica   | 🚨    | Requiere atención inmediata |
| HACK          | Alta      | ⚠️     | Código que necesita refactoring |
| TODO, OPTIMIZE| Normal    | 📝    | Mejoras planificadas |
| REVIEW, XXX   | Baja      | 💡    | Revisiones opcionales |
| NOTE          | Info      | ℹ️     | Información adicional |

## Formatos de Salida

### Consola (por defecto)
Salida colorizada y organizada con emojis y estadísticas.

### JSON
```json
{
  "timestamp": "2024-07-02T10:00:00Z",
  "stats": {
    "filesProcessed": 45,
    "todosFound": 12,
    "byType": {"TODO": 8, "FIXME": 3, "BUG": 1},
    "byPriority": {"normal": 8, "critical": 4}
  },
  "todos": [...]
}
```

### Markdown
Reporte estructurado ideal para documentación.

## Configuración

Edita `scripts/clean-config.json`:

```json
{
  "todoFinder": {
    "priorities": {
      "FIXME": "critical",
      "TODO": "normal"
    },
    "outputFormat": "console",
    "groupBy": "file",
    "showStats": true
  }
}
```

## Integración con CI/CD

```bash
# En tu pipeline
npm run find:todos:json
# Fallar si hay TODOs críticos
node -e "const r=require('./todos-report.json'); process.exit(r.stats.byPriority.critical > 0 ? 1 : 0)"
```