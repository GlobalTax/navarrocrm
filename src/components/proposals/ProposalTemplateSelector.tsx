
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Presentation } from 'lucide-react'
import { ProposalData } from '@/hooks/useProposalProfessional'

export type ProposalStyle = 'formal' | 'visual'

export interface BuiltInTemplate {
  id: string
  name: string
  description: string
  style: ProposalStyle
  icon: React.ReactNode
  defaults: Partial<ProposalData>
}

const builtInTemplates: BuiltInTemplate[] = [
  {
    id: 'formal-project',
    name: 'Propuesta Formal — Proyecto por Fases',
    description: 'Estilo carta legal con secciones numeradas, tabla de honorarios por fases, cláusula de confidencialidad y bloque de aceptación con firma.',
    style: 'formal',
    icon: <FileText className="h-8 w-8" />,
    defaults: {
      companyName: 'Navarro Legal y Tributario',
      companyDescription: 'Firma de profesionales especializada en asesoramiento fiscal y mercantil en operaciones corporativas, M&A, reestructuraciones empresariales y planificación patrimonial. Contamos con un equipo multidisciplinar con amplia experiencia en derecho societario, fiscalidad internacional y due diligence.',
      introduction: 'De acuerdo con nuestra reciente reunión y su solicitud de colaboración, tenemos el gusto de remitirles la presente propuesta de honorarios profesionales para el asesoramiento legal y fiscal del proyecto de referencia.',
      validityDays: 60,
      paymentTerms: '70% al aceptar el encargo y 30% al completar la fase correspondiente',
      confidentialityClause: true,
      expensesIncluded: false,
      iva: 21,
      phases: [
        {
          id: crypto.randomUUID(),
          name: 'Diagnóstico Integral',
          description: 'Análisis exhaustivo de la situación actual, revisión de la estructura societaria, fiscal y patrimonial. Identificación de contingencias y oportunidades de optimización.',
          services: [],
          deliverables: ['Informe de diagnóstico', 'Mapa de contingencias', 'Propuesta de estructura óptima'],
          paymentPercentage: 70,
          estimatedDuration: '2-3 semanas'
        },
        {
          id: crypto.randomUUID(),
          name: 'Implementación y Documentación',
          description: 'Redacción de documentos societarios, acuerdos entre partes, implementación de la estructura fiscal recomendada y coordinación con notaría y registros.',
          services: [],
          deliverables: ['Documentación societaria', 'Escrituras', 'Informe fiscal final'],
          paymentPercentage: 70,
          estimatedDuration: '4-6 semanas'
        }
      ],
      team: [
        { id: crypto.randomUUID(), name: '', role: 'Socio Coordinador', experience: 'Especialista en M&A y operaciones corporativas' },
        { id: crypto.randomUUID(), name: '', role: 'Abogado Senior', experience: 'Derecho societario y mercantil' },
        { id: crypto.randomUUID(), name: '', role: 'Asesor Fiscal', experience: 'Fiscalidad internacional y planificación patrimonial' }
      ]
    }
  },
  {
    id: 'visual-corporate',
    name: 'Propuesta Visual — Servicios Corporativos',
    description: 'Estilo presentación corporativa con portada destacada, diseño visual moderno, esquemas gráficos y tabla de honorarios minimalista.',
    style: 'visual',
    icon: <Presentation className="h-8 w-8" />,
    defaults: {
      companyName: 'Navarro Legal y Tributario',
      companyDescription: 'Somos una firma boutique de asesoramiento integral que combina expertise legal y tributario para ofrecer soluciones a medida a empresas y grupos empresariales. Nuestra metodología se basa en un enfoque personalizado, combinando rigor técnico con visión estratégica de negocio.',
      introduction: 'Agradecemos la confianza depositada en nuestra firma. A continuación presentamos nuestra propuesta de servicios profesionales adaptada a las necesidades específicas de su organización.',
      validityDays: 30,
      paymentTerms: 'Facturación mensual los primeros 5 días del mes siguiente',
      confidentialityClause: true,
      expensesIncluded: true,
      iva: 21,
      phases: [
        {
          id: crypto.randomUUID(),
          name: 'Asesoramiento Fiscal Recurrente',
          description: 'Servicio continuado de asesoramiento fiscal incluyendo planificación tributaria, revisión de obligaciones periódicas y consultas ilimitadas.',
          services: [],
          deliverables: ['Informes trimestrales', 'Alertas normativas', 'Consultas ilimitadas'],
          paymentPercentage: 100,
          estimatedDuration: 'Servicio continuado'
        },
        {
          id: crypto.randomUUID(),
          name: 'Asesoramiento Mercantil',
          description: 'Soporte legal para operaciones societarias, contratos mercantiles, juntas y acuerdos de socios.',
          services: [],
          deliverables: ['Actas societarias', 'Revisión contractual', 'Asesoramiento en juntas'],
          paymentPercentage: 100,
          estimatedDuration: 'Servicio continuado'
        }
      ],
      team: [
        { id: crypto.randomUUID(), name: '', role: 'Director de Proyecto', experience: 'Gestión de cuentas corporativas' },
        { id: crypto.randomUUID(), name: '', role: 'Equipo Fiscal', experience: 'Especialistas en tributación empresarial' }
      ]
    }
  }
]

interface ProposalTemplateSelectorProps {
  selectedStyle: ProposalStyle
  onSelectTemplate: (template: BuiltInTemplate) => void
  onStyleChange: (style: ProposalStyle) => void
}

export const ProposalTemplateSelector: React.FC<ProposalTemplateSelectorProps> = ({
  selectedStyle,
  onSelectTemplate,
  onStyleChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          Selecciona un estilo de propuesta. Puedes cargar una plantilla predefinida para rellenar los campos automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {builtInTemplates.map((template) => {
          const isSelected = selectedStyle === template.style
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary shadow-md' 
                  : 'border-[0.5px] border-black hover:border-primary/50'
              }`}
              style={{ borderRadius: '10px' }}
              onClick={() => {
                onStyleChange(template.style)
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      {isSelected && <Badge variant="default" className="text-xs">Seleccionado</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                    <button
                      className="text-xs text-primary hover:underline font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTemplate(template)
                      }}
                    >
                      Cargar datos de plantilla →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export { builtInTemplates }
