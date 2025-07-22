
#!/usr/bin/env node

/**
 * Script automático para limpiar console.logs en toda la aplicación
 * Utiliza los scripts existentes para hacer una limpieza integral
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuración
const config = {
  cleanGeneralLogs: true,
  cleanTimeTrackingLogs: true,
  createBackups: true,
  dryRun: false,
  interactive: false // En modo automatizado
};

console.log('🧹 Iniciando limpieza automática de console.logs...');

// Función para ejecutar scripts
function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(process.cwd(), scriptPath);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Script no encontrado: ${fullPath}`);
      return reject(`Script no encontrado: ${fullPath}`);
    }
    
    console.log(`🚀 Ejecutando: ${scriptPath} ${args.join(' ')}`);
    
    const child = spawn('node', [fullPath, ...args], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', code => {
      if (code !== 0) {
        console.error(`❌ Script finalizó con código de error: ${code}`);
        reject(`Error en script ${scriptPath}`);
      } else {
        console.log(`✅ Script completado: ${scriptPath}`);
        resolve();
      }
    });
  });
}

// Ejecutar scripts de limpieza
async function runCleanup() {
  try {
    // Limpieza general de console.logs
    if (config.cleanGeneralLogs) {
      const args = [
        config.dryRun ? '--dry-run' : '',
        config.interactive ? '' : '--no-interactive',
        config.createBackups ? '' : '--no-backup'
      ].filter(Boolean);
      
      await runScript('scripts/clean-console-logs.js', args);
    }
    
    // Limpieza específica de time tracking
    if (config.cleanTimeTrackingLogs) {
      await runScript('scripts/clean-time-tracking-logs.js');
    }
    
    console.log('🎉 Limpieza de console.logs completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  }
}

// Ejecutar limpieza
runCleanup();
