#!/usr/bin/env node

/**
 * Script para reemplazar masivamente console.log con logging estructurado
 * FASE 5: Eliminación masiva de console.log
 */

const fs = require('fs');
const path = require('path');

// Mapeo de contextos a loggers apropiados
const CONTEXT_LOGGER_MAP = {
  'Auth': 'authLogger',
  'App': 'appLogger', 
  'Route': 'routeLogger',
  'Profile': 'profileLogger',
  'Session': 'sessionLogger',
  'Setup': 'setupLogger',
  'AI': 'aiLogger',
  'Academia': 'logger',
  'Proposals': 'proposalsLogger',
  'Contacts': 'contactsLogger',
  'Cases': 'casesLogger',
  'Documents': 'documentsLogger',
  'Invoices': 'invoicesLogger',
  'Tasks': 'tasksLogger',
  'Performance': 'performanceLogger',
  'Email': 'logger',
  'Global': 'globalLogger'
};

// Función para detectar el contexto del archivo
function getFileContext(filePath) {
  const pathLower = filePath.toLowerCase();
  
  if (pathLower.includes('/auth/') || pathLower.includes('auth')) return 'Auth';
  if (pathLower.includes('/ai/') || pathLower.includes('aiassistant')) return 'AI';
  if (pathLower.includes('/academia/')) return 'Academia';
  if (pathLower.includes('/proposals/')) return 'Proposals';
  if (pathLower.includes('/contacts/')) return 'Contacts';
  if (pathLower.includes('/cases/')) return 'Cases';
  if (pathLower.includes('/documents/')) return 'Documents';
  if (pathLower.includes('/invoices/')) return 'Invoices';
  if (pathLower.includes('/tasks/')) return 'Tasks';
  if (pathLower.includes('/emails/')) return 'Email';
  if (pathLower.includes('performance')) return 'Performance';
  
  return 'Global';
}

// Función para generar el import apropiado
function getImportStatement(context) {
  const logger = CONTEXT_LOGGER_MAP[context];
  if (logger === 'logger') {
    return "import { logger } from '@/utils/logging'";
  }
  return `import { ${logger} } from '@/utils/logging'`;
}

// Función para reemplazar console.log con logging estructurado
function replaceConsoleLog(content, context) {
  const logger = CONTEXT_LOGGER_MAP[context] || 'logger';
  
  // Patrón para console.log con emoji y contexto
  const emojiLogPattern = /console\.log\(['"`]([🔍📧✅⚠️❌💡📝🚀📤🔄📦📖🕐⏱️📊🪝🧹🧪💻🎯🎨🔐👤].*?)['"`],?\s*([^)]*)\)/g;
  
  // Patrón para console.log simple
  const simpleLogPattern = /console\.log\(['"`]([^'"`]*?)['"`],?\s*([^)]*)\)/g;
  
  // Patrón para console.log con objetos
  const objectLogPattern = /console\.log\(([^)]+)\)/g;
  
  let modified = content;
  let changes = 0;
  
  // Reemplazar logs con emoji
  modified = modified.replace(emojiLogPattern, (match, message, data) => {
    changes++;
    // Limpiar el mensaje del emoji
    const cleanMessage = message.replace(/^[🔍📧✅⚠️❌💡📝🚀📤🔄📦📖🕐⏱️📊🪝🧹🧪💻🎯🎨🔐👤]\s*/, '');
    
    // Determinar el nivel según el emoji
    let level = 'info';
    if (message.includes('❌') || message.includes('Error')) level = 'error';
    else if (message.includes('⚠️') || message.includes('Warning')) level = 'warn';
    else if (message.includes('🔍') || message.includes('Debug')) level = 'debug';
    
    if (data && data.trim()) {
      return `${logger}.${level}('${cleanMessage}', { component: '${context}', ${data.trim()} })`;
    } else {
      return `${logger}.${level}('${cleanMessage}', { component: '${context}' })`;
    }
  });
  
  // Reemplazar logs simples
  modified = modified.replace(simpleLogPattern, (match, message, data) => {
    changes++;
    if (data && data.trim()) {
      return `${logger}.info('${message}', { component: '${context}', ${data.trim()} })`;
    } else {
      return `${logger}.info('${message}', { component: '${context}' })`;
    }
  });
  
  return { content: modified, changes };
}

// Función para añadir import si no existe
function addImportIfNeeded(content, context) {
  const logger = CONTEXT_LOGGER_MAP[context];
  const importStatement = getImportStatement(context);
  
  // Verificar si el import ya existe
  if (content.includes(importStatement) || content.includes(`import { ${logger}`)) {
    return content;
  }
  
  // Encontrar la última línea de import
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
    return lines.join('\n');
  }
  
  // Si no hay imports, añadir al principio
  return importStatement + '\n' + content;
}

// Función principal para procesar archivo
function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Archivo no encontrado: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const context = getFileContext(filePath);
  
  // Verificar si tiene console.log
  if (!content.includes('console.log')) {
    return;
  }
  
  // Reemplazar console.log
  const { content: newContent, changes } = replaceConsoleLog(content, context);
  
  if (changes > 0) {
    // Añadir import si es necesario
    const finalContent = addImportIfNeeded(newContent, context);
    
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`✅ ${filePath}: ${changes} logs reemplazados (contexto: ${context})`);
  }
}

// Lista de archivos críticos para procesar
const CRITICAL_FILES = [
  'src/components/academia/admin/AcademiaAdminPage.tsx',
  'src/components/academia/admin/CourseFormDialog.tsx',
  'src/components/admin/SuperAdminCreator.tsx',
  'src/components/ai/ContextualAssistant.tsx',
  'src/components/ai/IntelligentDashboard.tsx',
  'src/components/cases/wizard/MatterWizard.tsx',
  'src/components/cases/wizard/useWizardState.ts',
  'src/components/clients/NifLookup.tsx',
  'src/components/contacts/hooks/useNifSearch.ts',
  'src/components/contacts/tabs/BasicInfoTab.tsx',
  'src/components/diagnostics/HealthChecker.tsx',
  'src/components/documents/VirtualizedDocumentsList.tsx',
  'src/components/emails/RecentEmailsList.tsx',
  'src/components/integrations/EmailDiagnostics.tsx',
  'src/components/layout/HeaderClock.tsx',
  'src/components/optimization/LazyRouteWrapper.tsx',
  'src/components/proposals/ClientSelectorWithProspect.tsx',
  'src/components/proposals/NewProposalDialog.tsx',
  'src/components/proposals/ProposalPricingTab.tsx'
];

console.log('🧹 Iniciando limpieza masiva de console.log...\n');

let totalProcessed = 0;
CRITICAL_FILES.forEach(file => {
  try {
    processFile(file);
    totalProcessed++;
  } catch (error) {
    console.error(`❌ Error procesando ${file}:`, error.message);
  }
});

console.log(`\n✨ Fase 5 completada: ${totalProcessed} archivos procesados`);
console.log('📊 Siguiente: Verificar con lov-search-files para confirmar reducción');