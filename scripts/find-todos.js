#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración por defecto
const DEFAULT_CONFIG = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludeDirs: ['node_modules', 'dist', '.git', 'build', 'coverage', 'public'],
  excludeFiles: ['*.test.*', '*.spec.*', '*.config.*'],
  patterns: {
    todo: /(?:^|[^\/\*])(?:\/\*[\s\S]*?\*\/|\/\/.*$|(['"`])(?:(?!\1)[^\\]|\\.))*?\1|(?:\/\/|\/\*\s*)\s*(@?(?:TODO|FIXME|HACK|XXX|BUG|REVIEW|NOTE|OPTIMIZE))\s*(?:\([^)]*\))?\s*[:\-]?\s*([^*\/]*?)(?:\*\/|$)/gim
  },
  priorities: {
    'FIXME': 'critical',
    'BUG': 'critical', 
    'HACK': 'high',
    'TODO': 'normal',
    'OPTIMIZE': 'normal',
    'REVIEW': 'low',
    'XXX': 'low',
    'NOTE': 'info'
  },
  outputFormat: 'console', // console, json, markdown
  groupBy: 'file', // file, type, priority
  interactive: true,
  showStats: true
};

class TodoFinder {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      filesProcessed: 0,
      todosFound: 0,
      byType: {},
      byPriority: {},
      byFile: {}
    };
  }

  // Detectar TODOs de forma más inteligente
  findTodos(content, filePath) {
    const todos = [];
    const lines = content.split('\n');
    
    // Buscar TODOs línea por línea para mejor contexto
    lines.forEach((line, index) => {
      const matches = this.findTodosInLine(line);
      matches.forEach(match => {
        const todo = {
          file: filePath,
          line: index + 1,
          type: match.type.toUpperCase(),
          priority: this.config.priorities[match.type.toUpperCase()] || 'normal',
          message: match.message.trim(),
          fullLine: line.trim(),
          context: this.getContext(lines, index),
          user: match.user || null,
          date: match.date || null
        };
        todos.push(todo);
      });
    });

    return todos;
  }

  // Detectar TODOs en una línea específica
  findTodosInLine(line) {
    const todos = [];
    
    // Patrones más específicos
    const patterns = [
      // TODO: mensaje
      /(?:\/\/|\/\*)\s*(@?(?:TODO|FIXME|HACK|XXX|BUG|REVIEW|NOTE|OPTIMIZE))\s*[:\-]?\s*(.+?)(?:\*\/|$)/i,
      // TODO(usuario): mensaje
      /(?:\/\/|\/\*)\s*(@?(?:TODO|FIXME|HACK|XXX|BUG|REVIEW|NOTE|OPTIMIZE))\s*\(([^)]+)\)\s*[:\-]?\s*(.+?)(?:\*\/|$)/i,
      // TODO 2024-01-01: mensaje
      /(?:\/\/|\/\*)\s*(@?(?:TODO|FIXME|HACK|XXX|BUG|REVIEW|NOTE|OPTIMIZE))\s*(\d{4}-\d{2}-\d{2})\s*[:\-]?\s*(.+?)(?:\*\/|$)/i,
      // TODO HIGH: mensaje o TODO(usuario) 2024-01-01: mensaje
      /(?:\/\/|\/\*)\s*(@?(?:TODO|FIXME|HACK|XXX|BUG|REVIEW|NOTE|OPTIMIZE))\s*(?:\(([^)]+)\))?\s*(?:(HIGH|MEDIUM|LOW|CRITICAL))?\s*(?:(\d{4}-\d{2}-\d{2}))?\s*[:\-]?\s*(.+?)(?:\*\/|$)/i
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let type, user, date, priority, message;
        
        if (match.length === 3) {
          // Patrón simple: TODO: mensaje
          [, type, message] = match;
        } else if (match.length === 4) {
          // TODO(user): mensaje o TODO date: mensaje
          [, type, userOrDate, message] = match;
          if (userOrDate.match(/\d{4}-\d{2}-\d{2}/)) {
            date = userOrDate;
          } else {
            user = userOrDate;
          }
        } else {
          // Patrón complejo
          [, type, user, priority, date, message] = match;
        }

        todos.push({
          type: type.replace('@', ''),
          message: message || '',
          user,
          date,
          priority
        });
        break; // Solo uno por línea
      }
    }

    return todos;
  }

  // Obtener contexto alrededor de la línea
  getContext(lines, index) {
    return {
      before: lines.slice(Math.max(0, index - 1), index),
      after: lines.slice(index + 1, Math.min(lines.length, index + 2))
    };
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
    const allTodos = [];

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!this.config.excludeDirs.includes(item)) {
          const subTodos = await this.processDirectory(fullPath);
          allTodos.push(...subTodos);
        }
      } else if (this.shouldProcessFile(fullPath)) {
        this.stats.filesProcessed++;
        const fileTodos = await this.processFile(fullPath);
        allTodos.push(...fileTodos);
      }
    }

    return allTodos;
  }

  // Procesar un archivo individual
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const todos = this.findTodos(content, filePath);
      
      // Actualizar estadísticas
      this.stats.todosFound += todos.length;
      todos.forEach(todo => {
        this.stats.byType[todo.type] = (this.stats.byType[todo.type] || 0) + 1;
        this.stats.byPriority[todo.priority] = (this.stats.byPriority[todo.priority] || 0) + 1;
        this.stats.byFile[todo.file] = (this.stats.byFile[todo.file] || 0) + 1;
      });

      return todos;
    } catch (error) {
      console.error(`❌ Error procesando ${filePath}:`, error.message);
      return [];
    }
  }

  // Agrupar TODOs según configuración
  groupTodos(todos) {
    const grouped = {};
    
    todos.forEach(todo => {
      let key;
      switch (this.config.groupBy) {
        case 'type':
          key = todo.type;
          break;
        case 'priority':
          key = todo.priority;
          break;
        case 'file':
        default:
          key = todo.file;
          break;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(todo);
    });

    return grouped;
  }

  // Generar reporte en consola
  generateConsoleReport(todos) {
    if (todos.length === 0) {
      console.log('✅ No se encontraron TODOs en el código.');
      return;
    }

    const grouped = this.groupTodos(todos);
    const priorityOrder = ['critical', 'high', 'normal', 'low', 'info'];
    
    console.log(`📋 Se encontraron ${todos.length} TODOs:\n`);

    if (this.config.groupBy === 'priority') {
      // Mostrar por prioridad
      priorityOrder.forEach(priority => {
        if (grouped[priority]) {
          const emoji = this.getPriorityEmoji(priority);
          console.log(`${emoji} ${priority.toUpperCase()} (${grouped[priority].length})`);
          grouped[priority].forEach(todo => {
            console.log(`  📁 ${todo.file}:${todo.line}`);
            console.log(`    [${todo.type}] ${todo.message}`);
            if (todo.user) console.log(`    👤 Asignado a: ${todo.user}`);
            if (todo.date) console.log(`    📅 Fecha: ${todo.date}`);
          });
          console.log('');
        }
      });
    } else {
      // Mostrar por archivo o tipo
      Object.entries(grouped).forEach(([key, todos]) => {
        console.log(`📁 ${key} (${todos.length} TODOs):`);
        todos.forEach(todo => {
          const emoji = this.getPriorityEmoji(todo.priority);
          console.log(`  ${emoji} Línea ${todo.line}: [${todo.type}] ${todo.message}`);
          if (todo.user) console.log(`    👤 ${todo.user}`);
          if (todo.date) console.log(`    📅 ${todo.date}`);
        });
        console.log('');
      });
    }

    if (this.config.showStats) {
      this.generateStats();
    }
  }

  // Generar estadísticas
  generateStats() {
    console.log('📊 ESTADÍSTICAS:\n');
    console.log(`📂 Archivos procesados: ${this.stats.filesProcessed}`);
    console.log(`📝 TODOs encontrados: ${this.stats.todosFound}\n`);
    
    console.log('Por tipo:');
    Object.entries(this.stats.byType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    
    console.log('\nPor prioridad:');
    Object.entries(this.stats.byPriority)
      .sort(([,a], [,b]) => b - a)
      .forEach(([priority, count]) => {
        const emoji = this.getPriorityEmoji(priority);
        console.log(`  ${emoji} ${priority}: ${count}`);
      });

    const filesWithTodos = Object.keys(this.stats.byFile).length;
    console.log(`\nArchivos con TODOs: ${filesWithTodos}/${this.stats.filesProcessed}`);
  }

  // Obtener emoji por prioridad
  getPriorityEmoji(priority) {
    const emojis = {
      'critical': '🚨',
      'high': '⚠️',
      'normal': '📝',
      'low': '💡',
      'info': 'ℹ️'
    };
    return emojis[priority] || '📝';
  }

  // Generar reporte en JSON
  generateJsonReport(todos, outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      todos,
      config: this.config
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Reporte JSON generado: ${outputPath}`);
  }

  // Generar reporte en Markdown
  generateMarkdownReport(todos, outputPath) {
    let md = `# TODO Report\n\n`;
    md += `Generado: ${new Date().toLocaleString()}\n\n`;
    md += `## Resumen\n\n`;
    md += `- **Archivos procesados**: ${this.stats.filesProcessed}\n`;
    md += `- **TODOs encontrados**: ${this.stats.todosFound}\n\n`;
    
    if (todos.length > 0) {
      const grouped = this.groupTodos(todos);
      
      md += `## TODOs por Archivo\n\n`;
      Object.entries(grouped).forEach(([file, fileTodos]) => {
        md += `### ${file}\n\n`;
        fileTodos.forEach(todo => {
          md += `- **Línea ${todo.line}** \`[${todo.type}]\` ${todo.message}\n`;
          if (todo.user) md += `  - 👤 Asignado: ${todo.user}\n`;
          if (todo.date) md += `  - 📅 Fecha: ${todo.date}\n`;
        });
        md += `\n`;
      });
    }
    
    fs.writeFileSync(outputPath, md);
    console.log(`📝 Reporte Markdown generado: ${outputPath}`);
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

  // Ejecutar búsqueda
  async run(targetPath = './src', outputPath = null) {
    console.log('🔍 Iniciando búsqueda inteligente de TODOs...\n');
    
    console.log('⚙️  Configuración:');
    console.log(`   📁 Directorio: ${targetPath}`);
    console.log(`   📊 Agrupar por: ${this.config.groupBy}`);
    console.log(`   📄 Formato: ${this.config.outputFormat}\n`);

    const todos = await this.processDirectory(targetPath);

    // Generar reporte según el formato
    switch (this.config.outputFormat) {
      case 'json':
        this.generateJsonReport(todos, outputPath || 'todos-report.json');
        break;
      case 'markdown':
        this.generateMarkdownReport(todos, outputPath || 'todos-report.md');
        break;
      case 'console':
      default:
        this.generateConsoleReport(todos);
        break;
    }

    console.log('\n🎉 Búsqueda completada exitosamente!');
    return todos;
  }
}

// Manejo de argumentos de línea de comandos
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};

  args.forEach((arg, index) => {
    if (arg === '--json') config.outputFormat = 'json';
    if (arg === '--markdown') config.outputFormat = 'markdown';
    if (arg === '--no-interactive') config.interactive = false;
    if (arg === '--no-stats') config.showStats = false;
    if (arg.startsWith('--target=')) config.target = arg.split('=')[1];
    if (arg.startsWith('--output=')) config.output = arg.split('=')[1];
    if (arg.startsWith('--group-by=')) config.groupBy = arg.split('=')[1];
  });

  return config;
}

// Cargar configuración desde archivo
function loadConfig() {
  try {
    const configPath = path.join(__dirname, 'clean-config.json');
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Adaptar configuración del script de console.logs
    return {
      extensions: fileConfig.extensions,
      excludeDirs: fileConfig.excludeDirs,
      excludeFiles: fileConfig.excludeFiles,
      interactive: fileConfig.interactive
    };
  } catch (error) {
    console.warn('⚠️  No se pudo cargar configuración, usando valores por defecto');
    return {};
  }
}

// Punto de entrada
if (require.main === module) {
  const fileConfig = loadConfig();
  const argsConfig = parseArgs();
  const config = { ...fileConfig, ...argsConfig };
  
  const finder = new TodoFinder(config);
  const targetPath = config.target || './src';
  
  finder.run(targetPath, config.output).catch(error => {
    console.error('❌ Error durante la búsqueda:', error);
    process.exit(1);
  });
}

module.exports = TodoFinder;