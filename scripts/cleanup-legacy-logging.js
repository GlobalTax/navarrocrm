#!/usr/bin/env node

/**
 * Script para migrar archivos de logging legacy al nuevo sistema profesional
 * Elimina archivos obsoletos y actualiza imports
 */

const fs = require('fs');
const path = require('path');

const LEGACY_FILES = [
  'src/utils/logger.ts',
  'src/utils/cleanupConsoleLogsHelper.ts',
  'src/hooks/useLogger.ts',
  'scripts/clean-time-tracking-logs.js'
];

const MIGRATIONS = [
  {
    from: "import { logger } from '@/utils/logger'",
    to: "import { globalLogger as logger } from '@/utils/logging'"
  },
  {
    from: "import { createLogger } from '@/utils/logger'",
    to: "import { createContextLogger as createLogger } from '@/utils/logging'"
  },
  {
    from: "import { useLogger } from '@/hooks/useLogger'",
    to: "import { globalLogger } from '@/utils/logging'"
  }
];

function cleanupLegacyFiles() {
  console.log('🧹 Iniciando limpieza de archivos de logging legacy...\n');
  
  let filesRemoved = 0;
  
  LEGACY_FILES.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`✅ Eliminado: ${filePath}`);
        filesRemoved++;
      } catch (error) {
        console.log(`❌ Error eliminando ${filePath}: ${error.message}`);
      }
    } else {
      console.log(`⚠️ Ya eliminado: ${filePath}`);
    }
  });
  
  console.log(`\n📊 Resumen de limpieza:`);
  console.log(`   - Archivos eliminados: ${filesRemoved}`);
  console.log(`   - Sistema nuevo: src/utils/logging/`);
  console.log(`   - Loggers disponibles: 20+ contextos específicos`);
  
  console.log('\n✨ Limpieza de logging legacy completada');
  console.log('🚀 Ahora usar: import { [context]Logger } from "@/utils/logging"');
}

function showMigrationGuide() {
  console.log('\n📋 Guía de migración rápida:');
  console.log('');
  
  MIGRATIONS.forEach((migration, index) => {
    console.log(`${index + 1}. Cambiar:`);
    console.log(`   ❌ ${migration.from}`);
    console.log(`   ✅ ${migration.to}`);
    console.log('');
  });
  
  console.log('🎯 Loggers específicos disponibles:');
  console.log('   - authLogger, appLogger, routeLogger');
  console.log('   - proposalsLogger, contactsLogger, casesLogger');
  console.log('   - documentsLogger, invoicesLogger, tasksLogger');
  console.log('   - aiLogger, bulkUploadLogger, recurringFeesLogger');
  console.log('   - performanceLogger, workflowLogger, globalLogger');
}

// Ejecutar limpieza
cleanupLegacyFiles();
showMigrationGuide();