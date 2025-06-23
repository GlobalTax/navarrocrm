
import { Calculator, Users, Building, Scale } from 'lucide-react'

export interface LegalService {
  id: string
  name: string
  description: string
  basePrice: number
  billingUnit: string
  estimatedHours: number
}

export interface LegalPracticeArea {
  id: string
  name: string
  icon: any
  color: string
  services: LegalService[]
}

export const practiceAreasData: Record<string, LegalPracticeArea> = {
  fiscal: {
    id: 'fiscal',
    name: 'Fiscal y Tributario',
    icon: Calculator,
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    services: [
      {
        id: 'fiscal-1',
        name: 'Asesoría Fiscal Mensual',
        description: 'Gestión integral de obligaciones fiscales y tributarias',
        basePrice: 150,
        billingUnit: 'mes',
        estimatedHours: 8
      },
      {
        id: 'fiscal-2',
        name: 'Declaraciones Trimestrales',
        description: 'IVA, IRPF, Retenciones y otros impuestos periódicos',
        basePrice: 80,
        billingUnit: 'trimestre',
        estimatedHours: 4
      },
      {
        id: 'fiscal-3',
        name: 'Renta Anual',
        description: 'Declaración anual de la renta y patrimonio',
        basePrice: 200,
        billingUnit: 'año',
        estimatedHours: 6
      }
    ]
  },
  laboral: {
    id: 'laboral',
    name: 'Laboral y Seguridad Social',
    icon: Users,
    color: 'bg-green-50 border-green-200 text-green-800',
    services: [
      {
        id: 'laboral-1',
        name: 'Asesoría Laboral Integral',
        description: 'Gestión de nóminas, contratos y Seguridad Social',
        basePrice: 120,
        billingUnit: 'mes',
        estimatedHours: 10
      },
      {
        id: 'laboral-2',
        name: 'Gestión de Nóminas',
        description: 'Elaboración mensual de nóminas y seguros sociales',
        basePrice: 15,
        billingUnit: 'empleado/mes',
        estimatedHours: 1
      },
      {
        id: 'laboral-3',
        name: 'Representación Legal Laboral',
        description: 'Defensa en procedimientos laborales y Inspección',
        basePrice: 300,
        billingUnit: 'mes',
        estimatedHours: 5
      }
    ]
  },
  mercantil: {
    id: 'mercantil',
    name: 'Mercantil y Societario',
    icon: Building,
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    services: [
      {
        id: 'mercantil-1',
        name: 'Asesoría Societaria',
        description: 'Gestión de sociedades, juntas y documentación social',
        basePrice: 200,
        billingUnit: 'mes',
        estimatedHours: 6
      },
      {
        id: 'mercantil-2',
        name: 'Compliance Corporativo',
        description: 'Cumplimiento normativo y gobierno corporativo',
        basePrice: 400,
        billingUnit: 'mes',
        estimatedHours: 8
      }
    ]
  },
  civil: {
    id: 'civil',
    name: 'Civil y Patrimonial',
    icon: Scale,
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    services: [
      {
        id: 'civil-1',
        name: 'Asesoría Patrimonial',
        description: 'Gestión integral del patrimonio familiar y empresarial',
        basePrice: 250,
        billingUnit: 'mes',
        estimatedHours: 5
      }
    ]
  }
}
