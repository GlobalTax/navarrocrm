#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración por defecto
const DEFAULT_CONFIG = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludeDirs: ['node_modules', 'dist', '.git', 'build', 'coverage'],
  excludeFiles: ['*.test.*', '*.spec.*'],
  preserveTypes: ['error', 'warn'], // Tipos de console a preservar
  removeTypes: ['log', 'info', 'debug'], // Tipos de console a eliminar
  createBackup: true,
  dryRun: false,
  interactive: true
};

class ConsoleLogCleaner {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      logsRemoved: 0,
      logsPreserved: 0,
      errors: []
    };
  }

  // Detectar console.logs de forma más inteligente
  analyzeConsole(content) {
    const results = {
      toRemove: [],
      toPreserve: [],
      ambiguous: []
    };

    // Regex más específica que evita comentarios y strings
    const consoleRegex = /(?:^|[^\/\*])(?:\/\*[\s\S]*?\*\/|\/\/.*$|(['"`])(?:(?!\1)[^\\]|\\.))*?\1|console\.(log|error|warn|info|debug)\s*\([^)]*\);?\s*/gm;
    
    let match;
    while ((match = consoleRegex.exec(content)) !== null) {
      const [fullMatch, , consoleType] = match;
      
      // Si no hay consoleType, es un comentario o string, saltar
      if (!consoleType) continue;

      const context = this.getContext(content, match.index);
      const logInfo = {
        match: fullMatch,
        type: consoleType,
        index: match.index,
        line: this.getLineNumber(content, match.index),
        context
      };

      if (this.config.removeTypes.includes(consoleType)) {
        results.toRemove.push(logInfo);
      } else if (this.config.preserveTypes.includes(consoleType)) {
        results.toPreserve.push(logInfo);
      } else {
        results.ambiguous.push(logInfo);
      }
    }

    return results;
  }

  // Obtener contexto de líneas alrededor
  getContext(content, index) {
    const lines = content.substring(0, index).split('\n');
    const currentLine = lines.length;
    const allLines = content.split('\n');
    
    return {
      before: allLines.slice(Math.max(0, currentLine - 2), currentLine - 1),
      current: allLines[currentLine - 1] || '',
      after: allLines.slice(currentLine, Math.min(allLines.length, currentLine + 2))
    };
  }

  // Obtener número de línea
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Crear backup del archivo
  createBackup(filePath) {
    if (!this.config.createBackup) return null;
    
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }

  // Limpiar console.logs de un archivo
  async cleanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = this.analyzeConsole(content);
      
      if (analysis.toRemove.length === 0) {
        return { modified: false, analysis };
      }

      let newContent = content;
      let removedCount = 0;

      // Eliminar en orden inverso para mantener índices
      const toRemove = analysis.toRemove.sort((a, b) => b.index - a.index);
      
      for (const logInfo of toRemove) {
        const beforeRemoval = newContent.substring(0, logInfo.index);
        const afterRemoval = newContent.substring(logInfo.index + logInfo.match.length);
        newContent = beforeRemoval + afterRemoval;
        removedCount++;
      }

      // Validar sintaxis básica
      if (!this.validateSyntax(newContent)) {
        throw new Error('La sintaxis resultante parece incorrecta');
      }

      if (!this.config.dryRun) {
        this.createBackup(filePath);
        fs.writeFileSync(filePath, newContent, 'utf8');
      }

      this.stats.logsRemoved += removedCount;
      this.stats.logsPreserved += analysis.toPreserve.length;
      
      return { 
        modified: true, 
        analysis,
        removedCount,
        backupCreated: this.config.createBackup && !this.config.dryRun
      };

    } catch (error) {
      this.stats.errors.push({ file: filePath, error: error.message });
      return { modified: false, error: error.message };
    }
  }

  // Validación básica de sintaxis
  validateSyntax(content) {
    try {
      // Verificar balanceo básico de llaves
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      return Math.abs(openBraces - closeBraces) <= 1; // Tolerancia de 1
    } catch {
      return false;
    }
  }

  // Verificar si el archivo debe ser procesado
  shouldProcessFile(filePath) {
    const ext = path.extname(filePath);
    if (!this.config.extensions.includes(ext)) return false;

    const fileName = path.basename(filePath);
    return !this.config.excludeFiles.some(pattern => 
      fileName.includes(pattern.replace('*', ''))
    );
  }

  // Procesar directorio recursivamente
  async processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    const results = [];

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!this.config.excludeDirs.includes(item)) {
          const subResults = await this.processDirectory(fullPath);
          results.push(...subResults);
        }
      } else if (this.shouldProcessFile(fullPath)) {
        this.stats.filesProcessed++;
        const result = await this.cleanFile(fullPath);
        
        if (result.modified) {
          this.stats.filesModified++;
        }

        results.push({
          file: fullPath,
          ...result
        });
      }
    }

    return results;
  }

  // Mostrar preview de cambios
  showPreview(results) {
    console.log('\n📋 PREVIEW DE CAMBIOS:\n');
    
    const filesToModify = results.filter(r => r.modified);
    
    if (filesToModify.length === 0) {
      console.log('✨ No se encontraron archivos que necesiten limpieza.');
      return false;
    }

    filesToModify.forEach(result => {
      console.log(`📁 ${result.file}`);
      console.log(`   🗑️  Eliminar: ${result.removedCount} console.log(s)`);
      console.log(`   ✅ Preservar: ${result.analysis.toPreserve.length} console.error/warn(s)`);
      
      if (result.analysis.toRemove.length > 0) {
        console.log('   📍 Líneas afectadas:');
        result.analysis.toRemove.forEach(log => {
          console.log(`      Línea ${log.line}: console.${log.type}(...)`);
        });
      }
      console.log('');
    });

    return true;
  }

  // Generar reporte final
  generateReport(results) {
    console.log('\n📊 REPORTE DE LIMPIEZA:\n');
    console.log(`📂 Archivos procesados: ${this.stats.filesProcessed}`);
    console.log(`✏️  Archivos modificados: ${this.stats.filesModified}`);
    console.log(`🗑️  Console.logs eliminados: ${this.stats.logsRemoved}`);
    console.log(`✅ Console.errors/warns preservados: ${this.stats.logsPreserved}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errores encontrados: ${this.stats.errors.length}`);
      this.stats.errors.forEach(err => {
        console.log(`   ${err.file}: ${err.error}`);
      });
    }

    if (this.config.createBackup && !this.config.dryRun) {
      console.log('\n💾 Se crearon backups para archivos modificados');
    }
  }

  // Confirmación interactiva
  async askConfirmation(message) {
    if (!this.config.interactive) return true;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(`${message} (y/N): `, answer => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  // Ejecutar limpieza
  async run(targetPath = './src') {
    console.log('🧹 Iniciando limpieza inteligente de console.logs...\n');
    
    if (this.config.dryRun) {
      console.log('🔍 MODO DRY-RUN: Solo se mostrarán los cambios sin ejecutarlos\n');
    }

    console.log('⚙️  Configuración:');
    console.log(`   📁 Directorio: ${targetPath}`);
    console.log(`   🗑️  Eliminar: console.${this.config.removeTypes.join(', console.')}`);
    console.log(`   ✅ Preservar: console.${this.config.preserveTypes.join(', console.')}`);
    console.log(`   💾 Backup: ${this.config.createBackup ? 'Sí' : 'No'}\n`);

    const results = await this.processDirectory(targetPath);
    const hasChanges = this.showPreview(results);

    if (!hasChanges) {
      return;
    }

    if (this.config.dryRun) {
      console.log('🔍 Ejecuta sin --dry-run para aplicar los cambios.');
      return;
    }

    const confirmed = await this.askConfirmation('¿Proceder con la limpieza?');
    if (!confirmed) {
      console.log('❌ Limpieza cancelada por el usuario.');
      return;
    }

    this.generateReport(results);
    console.log('\n🎉 Limpieza completada exitosamente!');
  }
}

// Manejo de argumentos de línea de comandos
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};

  args.forEach(arg => {
    if (arg === '--dry-run') config.dryRun = true;
    if (arg === '--no-backup') config.createBackup = false;
    if (arg === '--no-interactive') config.interactive = false;
    if (arg.startsWith('--target=')) config.target = arg.split('=')[1];
  });

  return config;
}

// Punto de entrada
if (require.main === module) {
  const config = parseArgs();
  const cleaner = new ConsoleLogCleaner(config);
  const targetPath = config.target || './src';
  
  cleaner.run(targetPath).catch(error => {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  });
}

module.exports = ConsoleLogCleaner;