# 🧹 Script de Limpieza Inteligente de Console.logs

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