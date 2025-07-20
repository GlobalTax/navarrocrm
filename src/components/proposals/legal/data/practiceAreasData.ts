import { Calculator, Scale, Building, Users, FileText, Shield } from 'lucide-react'

export interface ServiceData {
  id: string
  name: string
  description: string
  price: number
  basePrice: number
  billingUnit: string
  estimatedHours?: number
  category?: string
}

export interface PracticeAreaData {
  id: string
  name: string
  description: string
  icon: any
  color: string
  services: ServiceData[]
}

// Legacy types for backward compatibility
export type LegalPracticeArea = PracticeAreaData
export type LegalService = ServiceData

// Datos estáticos para áreas de práctica con servicios reales
export const practiceAreasData: Record<string, PracticeAreaData> = {
  contabilidad: {
    id: 'contabilidad',
    name: 'Contabilidad y Auditoría',
    description: 'Servicios especializados en contabilidad, auditoría y revisión financiera',
    icon: Calculator,
    color: '#10b981',
    services: [
      {
        id: 'contabilidad-mensual',
        name: 'Contabilidad Mensual',
        description: 'Gestión integral de la contabilidad mensual de la empresa incluyendo registro de operaciones, conciliaciones y reportes',
        price: 800,
        basePrice: 800,
        billingUnit: 'mes',
        estimatedHours: 20,
        category: 'recurring'
      },
      {
        id: 'revision-trimestral',
        name: 'Revisión Contable Trimestral',
        description: 'Revisión exhaustiva y análisis de estados contables trimestrales con recomendaciones de mejora',
        price: 1200,
        basePrice: 1200,
        billingUnit: 'trimestre',
        estimatedHours: 30,
        category: 'periodic'
      },
      {
        id: 'auditoria-interna',
        name: 'Auditoría Interna Anual',
        description: 'Auditoría interna completa de procesos y estados financieros con informe detallado',
        price: 3500,
        basePrice: 3500,
        billingUnit: 'año',
        estimatedHours: 80,
        category: 'annual'
      },
      {
        id: 'conciliaciones-bancarias',
        name: 'Conciliaciones Bancarias',
        description: 'Conciliación mensual de todas las cuentas bancarias y seguimiento de diferencias',
        price: 150,
        basePrice: 150,
        billingUnit: 'mes',
        estimatedHours: 4,
        category: 'recurring'
      },
      {
        id: 'estados-financieros',
        name: 'Estados Financieros',
        description: 'Elaboración de estados financieros mensuales: balance, pérdidas y ganancias, cash flow',
        price: 400,
        basePrice: 400,
        billingUnit: 'mes',
        estimatedHours: 12,
        category: 'recurring'
      },
      {
        id: 'asesoria-contable',
        name: 'Asesoría Contable Integral',
        description: 'Asesoramiento contable continuo, resolución de consultas y apoyo en decisiones financieras',
        price: 500,
        basePrice: 500,
        billingUnit: 'mes',
        estimatedHours: 15,
        category: 'consulting'
      }
    ]
  },
  fiscal: {
    id: 'fiscal',
    name: 'Asesoría Fiscal',
    description: 'Servicios especializados en tributación y cumplimiento fiscal',
    icon: FileText,
    color: '#3b82f6',
    services: [
      {
        id: 'declaracion-iva',
        name: 'Declaración de IVA',
        description: 'Preparación y presentación de declaraciones de IVA trimestrales',
        price: 200,
        basePrice: 200,
        billingUnit: 'trimestre',
        estimatedHours: 5,
        category: 'recurring'
      },
      {
        id: 'renta-sociedades',
        name: 'Impuesto de Sociedades',
        description: 'Preparación y presentación del Impuesto de Sociedades anual',
        price: 1500,
        basePrice: 1500,
        billingUnit: 'año',
        estimatedHours: 35,
        category: 'annual'
      },
      {
        id: 'planificacion-fiscal',
        name: 'Planificación Fiscal',
        description: 'Estrategias de optimización fiscal y planificación tributaria',
        price: 800,
        basePrice: 800,
        billingUnit: 'consulta',
        estimatedHours: 20,
        category: 'consulting'
      }
    ]
  },
  laboral: {
    id: 'laboral',
    name: 'Asesoría Laboral',
    description: 'Gestión integral de recursos humanos y cumplimiento laboral',
    icon: Users,
    color: '#8b5cf6',
    services: [
      {
        id: 'nominas-ss',
        name: 'Nóminas y Seguridad Social',
        description: 'Gestión mensual de nóminas y tramitación de Seguridad Social',
        price: 25,
        basePrice: 25,
        billingUnit: 'empleado/mes',
        estimatedHours: 2,
        category: 'recurring'
      },
      {
        id: 'contratos-laborales',
        name: 'Contratos Laborales',
        description: 'Redacción y gestión de contratos laborales y modificaciones',
        price: 150,
        basePrice: 150,
        billingUnit: 'contrato',
        estimatedHours: 3,
        category: 'per_case'
      },
      {
        id: 'asesoria-rrhh',
        name: 'Asesoría en RRHH',
        description: 'Consultoría en políticas de recursos humanos y resolución de conflictos',
        price: 600,
        basePrice: 600,
        billingUnit: 'mes',
        estimatedHours: 15,
        category: 'consulting'
      }
    ]
  },
  juridico: {
    id: 'juridico',
    name: 'Asesoría Jurídica',
    description: 'Servicios legales especializados y representación jurídica',
    icon: Scale,
    color: '#ef4444',
    services: [
      {
        id: 'consultoria-juridica',
        name: 'Consultoría Jurídica General',
        description: 'Asesoramiento jurídico en materias diversas y resolución de consultas legales',
        price: 200,
        basePrice: 200,
        billingUnit: 'hora',
        estimatedHours: 1,
        category: 'hourly'
      },
      {
        id: 'contratos-mercantiles',
        name: 'Contratos Mercantiles',
        description: 'Redacción y revisión de contratos comerciales y mercantiles',
        price: 400,
        basePrice: 400,
        billingUnit: 'contrato',
        estimatedHours: 8,
        category: 'per_case'
      },
      {
        id: 'representacion-judicial',
        name: 'Representación Judicial',
        description: 'Representación y defensa en procedimientos judiciales',
        price: 300,
        basePrice: 300,
        billingUnit: 'hora',
        estimatedHours: 1,
        category: 'hourly'
      }
    ]
  },
  mercantil: {
    id: 'mercantil',
    name: 'Derecho Mercantil',
    description: 'Asesoramiento especializado en derecho societario y mercantil',
    icon: Building,
    color: '#f59e0b',
    services: [
      {
        id: 'constitucion-sociedades',
        name: 'Constitución de Sociedades',
        description: 'Tramitación completa para constitución de sociedades mercantiles',
        price: 800,
        basePrice: 800,
        billingUnit: 'sociedad',
        estimatedHours: 15,
        category: 'per_case'
      },
      {
        id: 'modificaciones-sociales',
        name: 'Modificaciones Societarias',
        description: 'Ampliaciones de capital, cambios de objeto social y otras modificaciones',
        price: 500,
        basePrice: 500,
        billingUnit: 'modificación',
        estimatedHours: 10,
        category: 'per_case'
      },
      {
        id: 'compliance-mercantil',
        name: 'Compliance Mercantil',
        description: 'Asesoramiento en cumplimiento normativo y gobierno corporativo',
        price: 1000,
        basePrice: 1000,
        billingUnit: 'mes',
        estimatedHours: 25,
        category: 'consulting'
      }
    ]
  },
  proteccion_datos: {
    id: 'proteccion_datos',
    name: 'Protección de Datos',
    description: 'Servicios especializados en RGPD y protección de datos',
    icon: Shield,
    color: '#6366f1',
    services: [
      {
        id: 'adaptacion-rgpd',
        name: 'Adaptación RGPD',
        description: 'Análisis y adaptación completa al Reglamento General de Protección de Datos',
        price: 1200,
        basePrice: 1200,
        billingUnit: 'proyecto',
        estimatedHours: 30,
        category: 'per_case'
      },
      {
        id: 'auditoria-proteccion-datos',
        name: 'Auditoría de Protección de Datos',
        description: 'Auditoría anual del cumplimiento en materia de protección de datos',
        price: 800,
        basePrice: 800,
        billingUnit: 'año',
        estimatedHours: 20,
        category: 'annual'
      },
      {
        id: 'dpo-externo',
        name: 'DPO Externo',
        description: 'Servicios de Delegado de Protección de Datos externo',
        price: 400,
        basePrice: 400,
        billingUnit: 'mes',
        estimatedHours: 10,
        category: 'recurring'
      }
    ]
  }
}

// Función helper para obtener todos los servicios
export const getAllServices = (): ServiceData[] => {
  return Object.values(practiceAreasData).flatMap(area => area.services)
}

// Función helper para buscar servicios por categoría
export const getServicesByCategory = (category: string): ServiceData[] => {
  return getAllServices().filter(service => service.category === category)
}