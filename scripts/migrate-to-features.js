#!/usr/bin/env node

/**
 * Script para migrar a arquitectura basada en features
 * FASE 6: Migración Completa a Features
 */

const fs = require('fs');
const path = require('path');

// Features prioritarios para migrar
const FEATURES_TO_MIGRATE = [
  {
    name: 'time-tracking',
    description: 'Gestión de tiempo y time tracking',
    sourceFiles: [
      'src/pages/TimeTracking.tsx',
      'src/components/time-tracking/**',
      'src/hooks/useTimeEntries.ts',
      'src/hooks/useMonthlyTimeStats.ts'
    ]
  },
  {
    name: 'calendar',
    description: 'Gestión de calendario y eventos',
    sourceFiles: [
      'src/pages/Calendar.tsx',
      'src/components/calendar/**',
      'src/hooks/useCalendarEvents.ts'
    ]
  },
  {
    name: 'cases',
    description: 'Gestión de expedientes legales',
    sourceFiles: [
      'src/pages/Cases.tsx',
      'src/components/cases/**',
      'src/hooks/useCases.ts'
    ]
  },
  {
    name: 'contacts',
    description: 'Gestión de contactos y clientes',
    sourceFiles: [
      'src/pages/Contacts.tsx',
      'src/components/contacts/**',
      'src/hooks/useContacts.ts'
    ]
  },
  {
    name: 'invoices',
    description: 'Gestión de facturación',
    sourceFiles: [
      'src/pages/Invoicing.tsx',
      'src/components/invoices/**',
      'src/hooks/useInvoices.ts'
    ]
  }
];

// Template para el index.ts de cada feature
const FEATURE_INDEX_TEMPLATE = (featureName, description) => `/**
 * ${featureName.charAt(0).toUpperCase() + featureName.slice(1)} Feature - ${description}
 * FASE 6: Migración a arquitectura basada en features
 */

// Types
export type { 
  // TODO: Definir tipos específicos del feature
} from './types'

// Services  
export {
  // TODO: Exportar servicios cuando estén implementados
} from './services'

// Hooks
export {
  // TODO: Exportar hooks cuando estén migrados
} from './hooks'

// Components
export {
  // TODO: Exportar componentes cuando estén migrados
} from './components'

// Utils
export {
  // TODO: Exportar utilidades específicas
} from './utils'

// Constants
export {
  // TODO: Exportar constantes del feature
} from './constants'
`;

// Template para types.ts
const TYPES_TEMPLATE = (featureName) => `/**
 * ${featureName.charAt(0).toUpperCase() + featureName.slice(1)} Feature Types
 */

// TODO: Definir interfaces y tipos específicos del feature ${featureName}

export interface ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Item {
  id: string
  // TODO: Agregar propiedades específicas
  created_at: string
  updated_at: string
}

export interface ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Filter {
  // TODO: Definir filtros disponibles
  search?: string
  date_from?: string
  date_to?: string
}

export interface Create${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Data {
  // TODO: Definir estructura para crear elementos
}

export interface Update${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Data {
  // TODO: Definir estructura para actualizar elementos
}
`;

// Template para constants.ts
const CONSTANTS_TEMPLATE = (featureName) => `/**
 * ${featureName.charAt(0).toUpperCase() + featureName.slice(1)} Feature Constants
 */

// TODO: Definir constantes específicas del feature ${featureName}

export const ${featureName.toUpperCase()}_DEFAULTS = {
  // TODO: Valores por defecto
} as const

export const ${featureName.toUpperCase()}_STATUSES = {
  // TODO: Estados disponibles
} as const

export const ${featureName.toUpperCase()}_TYPES = {
  // TODO: Tipos disponibles
} as const
`;

function createFeatureStructure(feature) {
  const featureDir = `src/features/${feature.name}`;
  
  // Crear directorios
  const dirs = [
    featureDir,
    `${featureDir}/components`,
    `${featureDir}/hooks`,
    `${featureDir}/services`,
    `${featureDir}/utils`
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
  
  // Crear archivos base
  const files = [
    {
      path: `${featureDir}/index.ts`,
      content: FEATURE_INDEX_TEMPLATE(feature.name, feature.description)
    },
    {
      path: `${featureDir}/types.ts`,
      content: TYPES_TEMPLATE(feature.name)
    },
    {
      path: `${featureDir}/constants.ts`,
      content: CONSTANTS_TEMPLATE(feature.name)
    }
  ];
  
  files.forEach(file => {
    if (!fs.existsSync(file.path)) {
      fs.writeFileSync(file.path, file.content, 'utf8');
      console.log(`📄 Archivo creado: ${file.path}`);
    }
  });
  
  return featureDir;
}

// Función para crear el barrel export principal
function createFeaturesBarrel() {
  const featuresIndexPath = 'src/features/index.ts';
  
  let content = `/**
 * Features Barrel Export
 * FASE 6: Migración a arquitectura basada en features
 */

// Auth Feature (Completado)
export * from './auth'

// Documents Feature (Estructura base)
export * from './documents'

`;

  FEATURES_TO_MIGRATE.forEach(feature => {
    content += `// ${feature.name.charAt(0).toUpperCase() + feature.name.slice(1)} Feature\n`;
    content += `export * from './${feature.name}'\n\n`;
  });

  content += `// TODO: Agregar más features conforme se vayan migrando
// - proposals
// - tasks  
// - reports
// - settings
`;

  fs.writeFileSync(featuresIndexPath, content, 'utf8');
  console.log(`📄 Archivo creado: ${featuresIndexPath}`);
}

// Función principal
function migrateToFeatures() {
  console.log('🚀 Iniciando migración a arquitectura basada en features...\n');
  
  // Crear directorio features principal
  if (!fs.existsSync('src/features')) {
    fs.mkdirSync('src/features', { recursive: true });
    console.log('📁 Directorio principal creado: src/features');
  }
  
  let totalFeatures = 0;
  
  // Migrar cada feature
  FEATURES_TO_MIGRATE.forEach(feature => {
    console.log(`\n🔄 Migrando feature: ${feature.name}`);
    console.log(`   📝 ${feature.description}`);
    
    try {
      createFeatureStructure(feature);
      totalFeatures++;
      console.log(`✅ Feature ${feature.name} estructurado correctamente`);
    } catch (error) {
      console.error(`❌ Error migrando ${feature.name}:`, error.message);
    }
  });
  
  // Crear barrel export
  console.log('\n📦 Creando barrel exports...');
  createFeaturesBarrel();
  
  console.log(`\n✨ FASE 6 completada parcialmente:`);
  console.log(`   📊 ${totalFeatures} features estructurados`);
  console.log(`   🏗️ Arquitectura base establecida`);
  console.log(`   📋 Próximos pasos: Migrar código existente a cada feature`);
  
  console.log('\n📋 Checklist post-migración:');
  console.log('   □ Actualizar imports en componentes existentes');
  console.log('   □ Mover servicios específicos a cada feature');
  console.log('   □ Crear DAL (Data Access Layer) para cada feature');
  console.log('   □ Establecer barrel exports consistentes');
}

// Ejecutar migración
migrateToFeatures();