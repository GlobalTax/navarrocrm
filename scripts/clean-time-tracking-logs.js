#!/usr/bin/env node

/**
 * Script para limpiar console.logs específicos del time tracking
 * Preserva errores críticos y limpia logs de desarrollo
 */

const fs = require('fs');
const path = require('path');

const TIME_TRACKING_FILES = [
  'src/pages/TimeTracking.tsx',
  'src/components/time-tracking/TimeTrackingDashboard.tsx',
  'src/components/time-tracking/TimeTrackingSummary.tsx',
  'src/hooks/useMonthlyTimeStats.ts',
  'src/hooks/useTimeEntries.ts'
];

function cleanFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ Archivo no encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let cleaned = 0;

  // Limpiar console.log informativos específicos del time tracking
  const patterns = [
    /console\.log\(['"`]⏱️.*?\);?\s*\n/g,
    /console\.log\(['"`]✅.*tiempo.*?\);?\s*\n/g,
    /console\.log\(['"`]📊.*stats.*?\);?\s*\n/g,
    /console\.log\(['"`]🕐.*timer.*?\);?\s*\n/g,
  ];

  patterns.forEach(pattern => {
    const matches = content.match(pattern) || [];
    cleaned += matches.length;
    content = content.replace(pattern, '');
  });

  // Preservar console.error para errores críticos
  const preservedErrors = [
    'Error fetching monthly time stats:',
    'Error creating time entry:',
    'Error deleting time entry:'
  ];

  fs.writeFileSync(fullPath, content, 'utf8');
  
  if (cleaned > 0) {
    console.log(`✅ ${filePath}: ${cleaned} logs limpiados`);
  }
}

console.log('🧹 Limpiando logs del time tracking...\n');

TIME_TRACKING_FILES.forEach(cleanFile);

console.log('\n✨ Limpieza de time tracking completada');