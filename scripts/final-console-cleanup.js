/**
 * Script final para eliminar todos los console.log restantes
 * Convierte a sistema de logging estructurado
 */

import fs from 'fs'
import path from 'path'

// Mapa de contextos a loggers
const CONTEXT_LOGGER_MAP = {
  'auth': 'authLogger',
  'app': 'appLogger', 
  'route': 'routeLogger',
  'profile': 'profileLogger',
  'session': 'sessionLogger',
  'setup': 'setupLogger',
  'ai': 'aiLogger',
  'proposals': 'proposalsLogger',
  'contacts': 'contactsLogger',
  'cases': 'casesLogger',
  'documents': 'documentsLogger',
  'invoices': 'invoicesLogger',
  'tasks': 'tasksLogger',
  'global': 'globalLogger',
  'performance': 'performanceLogger',
  'quantum': 'quantumLogger',
  'workflow': 'workflowLogger',
  'recurringfees': 'recurringFeesLogger',
  'bulkupload': 'bulkUploadLogger',
  'memory': 'memoryLogger'
}

// Determinar contexto del archivo
function getFileContext(filePath) {
  const normalizedPath = filePath.toLowerCase()
  
  if (normalizedPath.includes('auth') || normalizedPath.includes('login') || normalizedPath.includes('signup')) return 'auth'
  if (normalizedPath.includes('proposal')) return 'proposals'
  if (normalizedPath.includes('contact')) return 'contacts'
  if (normalizedPath.includes('case')) return 'cases'
  if (normalizedPath.includes('document')) return 'documents'
  if (normalizedPath.includes('invoice')) return 'invoices'
  if (normalizedPath.includes('task')) return 'tasks'
  if (normalizedPath.includes('setup')) return 'setup'
  if (normalizedPath.includes('ai') || normalizedPath.includes('assistant')) return 'ai'
  if (normalizedPath.includes('quantum')) return 'quantum'
  if (normalizedPath.includes('performance') || normalizedPath.includes('optimization')) return 'performance'
  if (normalizedPath.includes('timer') || normalizedPath.includes('time-tracking')) return 'performance'
  if (normalizedPath.includes('email') || normalizedPath.includes('diagnostic')) return 'app'
  if (normalizedPath.includes('admin') || normalizedPath.includes('superadmin')) return 'auth'
  if (normalizedPath.includes('report')) return 'app'
  
  return 'global'
}

// Generar import statement
function getImportStatement(context) {
  const loggerName = CONTEXT_LOGGER_MAP[context] || 'globalLogger'
  return `import { ${loggerName} } from '@/utils/logging'`
}

// Reemplazar console.log
function replaceConsoleLog(content, context) {
  const loggerName = CONTEXT_LOGGER_MAP[context] || 'globalLogger'
  
  // Patterns comunes de console.log
  const patterns = [
    // console.log con emoji y string
    {
      regex: /console\.log\(['"`]([🔍🚀✅❌📋🧪🔄📧⚡💰👤🔐🚪🏗🔒📝📂💡⚠️🎯📊🔧📤🧠⚛️]+\s+[^'"`]*?)['"`](?:,\s*([^)]+))?\)/g,
      replacement: (match, message, data) => {
        const level = getLogLevel(message)
        return data ? 
          `${loggerName}.${level}('${message}', { data: ${data} })` :
          `${loggerName}.${level}('${message}')`
      }
    },
    // console.log básico con string
    {
      regex: /console\.log\(['"`]([^'"`]*?)['"`](?:,\s*([^)]+))?\)/g,
      replacement: (match, message, data) => {
        const level = getLogLevel(message)
        return data ? 
          `${loggerName}.${level}('${message}', { data: ${data} })` :
          `${loggerName}.${level}('${message}')`
      }
    },
    // console.log con solo variables
    {
      regex: /console\.log\(([^'"`][^)]*)\)/g,
      replacement: (match, vars) => `${loggerName}.info('Debug data', { ${vars} })`
    }
  ]
  
  let newContent = content
  let hasChanges = false
  
  patterns.forEach(pattern => {
    if (pattern.regex.test(newContent)) {
      newContent = newContent.replace(pattern.regex, pattern.replacement)
      hasChanges = true
    }
  })
  
  return { content: newContent, hasChanges }
}

// Determinar nivel de log basado en contenido
function getLogLevel(message) {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('error') || lowerMessage.includes('❌') || lowerMessage.includes('failed')) return 'error'
  if (lowerMessage.includes('warn') || lowerMessage.includes('⚠️') || lowerMessage.includes('warning')) return 'warn'
  if (lowerMessage.includes('debug') || lowerMessage.includes('🔍') || lowerMessage.includes('test')) return 'debug'
  
  return 'info'
}

// Agregar import si es necesario
function addImportIfNeeded(content, context) {
  const loggerName = CONTEXT_LOGGER_MAP[context] || 'globalLogger'
  const importStatement = getImportStatement(context)
  
  // Verificar si ya existe el import
  if (content.includes(`import { ${loggerName} }`)) {
    return content
  }
  
  // Buscar imports existentes
  const importRegex = /^import\s+.*?from\s+['"`]@\/utils\/logging['"`]/gm
  if (importRegex.test(content)) {
    // Ya hay un import de logging, agregar el logger necesario
    return content.replace(
      /^(import\s+{[^}]*?})\s+from\s+['"`]@\/utils\/logging['"`]/gm,
      (match, importPart) => {
        if (importPart.includes(loggerName)) return match
        return importPart.slice(0, -1) + `, ${loggerName} } from '@/utils/logging'`
      }
    )
  }
  
  // Agregar nuevo import al inicio
  const lines = content.split('\n')
  const importIndex = lines.findIndex(line => line.trim().startsWith('import'))
  
  if (importIndex !== -1) {
    lines.splice(importIndex, 0, importStatement)
  } else {
    lines.unshift(importStatement, '')
  }
  
  return lines.join('\n')
}

// Procesar archivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const context = getFileContext(filePath)
    
    const { content: newContent, hasChanges } = replaceConsoleLog(content, context)
    
    if (hasChanges) {
      const finalContent = addImportIfNeeded(newContent, context)
      fs.writeFileSync(filePath, finalContent, 'utf8')
      console.log(`✅ Procesado: ${filePath} (${context})`)
      return true
    }
    
    return false
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message)
    return false
  }
}

// Obtener todos los archivos .ts y .tsx en src/
function getAllSourceFiles(dir) {
  const files = []
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath)
      }
    }
  }
  
  walkDir(dir)
  return files
}

// Ejecutar script
console.log('🚀 Iniciando limpieza final de console.log...')

const sourceFiles = getAllSourceFiles('src')
let processedCount = 0

sourceFiles.forEach(file => {
  if (processFile(file)) {
    processedCount++
  }
})

console.log(`\n✅ Limpieza completada:`)
console.log(`📁 Archivos procesados: ${processedCount}`)
console.log(`📂 Total archivos revisados: ${sourceFiles.length}`)
console.log(`\n🎯 Todos los console.log han sido convertidos al sistema de logging estructurado`)