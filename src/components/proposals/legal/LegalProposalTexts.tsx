
import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileText, RotateCcw } from 'lucide-react'
import { useDefaultProposalTexts } from '@/hooks/useDefaultProposalTexts'
import { DefaultTextsManager } from './DefaultTextsManager'

interface LegalProposalTextsProps {
  introduction: string
  onIntroductionChange: (value: string) => void
  terms: string
  onTermsChange: (value: string) => void
  practiceArea: string
}

const getHardcodedDefaultTexts = (practiceArea: string) => {
  const defaults = {
    fiscal: {
      introduction: `Estimado cliente,

Nos complace presentarle nuestra propuesta de servicios jurídicos especializados en materia fiscal y tributaria. Nuestro despacho cuenta con amplia experiencia en el asesoramiento integral a empresas y particulares en todas las obligaciones fiscales.

La presente propuesta incluye el asesoramiento continuado y la gestión de sus obligaciones tributarias, adaptándonos a las necesidades específicas de su actividad empresarial.`,
      terms: `TÉRMINOS Y CONDICIONES ESPECÍFICAS:

1. PERIODICIDAD: Los servicios se prestarán de forma continuada según la modalidad contratada.

2. COMUNICACIONES: Mantendremos comunicación fluida para resolver cualquier consulta fiscal que pueda surgir.

3. NORMATIVA APLICABLE: Todos los servicios se prestan conforme a la legislación fiscal vigente.

4. RESPONSABILIDAD: El cliente se compromete a facilitar toda la documentación necesaria en tiempo y forma.

5. DURACIÓN: El presente contrato tendrá la duración especificada, renovándose automáticamente salvo denuncia por cualquiera de las partes.`
    },
    laboral: {
      introduction: `Estimado cliente,

Le presentamos nuestra propuesta de servicios jurídicos especializados en derecho laboral y seguridad social. Ofrecemos un servicio integral que abarca desde la gestión de nóminas hasta la representación en procedimientos laborales.

Nuestro objetivo es garantizar el cumplimiento de todas las obligaciones laborales y proporcionar la tranquilidad necesaria para el desarrollo de su actividad empresarial.`,
      terms: `TÉRMINOS Y CONDICIONES ESPECÍFICAS:

1. SERVICIOS INCLUIDOS: Gestión integral de recursos humanos, nóminas y seguridad social.

2. PROCEDIMIENTOS: Representación en inspecciones laborales y procedimientos administrativos.

3. CONSULTAS: Atención personalizada para resolución de dudas laborales.

4. ACTUALIZACIONES: Información periódica sobre cambios normativos que afecten a su empresa.

5. CONFIDENCIALIDAD: Máxima confidencialidad en el tratamiento de datos laborales.`
    }
  }

  return defaults[practiceArea as keyof typeof defaults] || defaults.fiscal
}

export const LegalProposalTexts: React.FC<LegalProposalTextsProps> = ({
  introduction,
  onIntroductionChange,
  terms,
  onTermsChange,
  practiceArea
}) => {
  const { getDefaultTextsByArea } = useDefaultProposalTexts()

  const handleResetTexts = () => {
    // Primero intentar obtener textos personalizados
    const customTexts = getDefaultTextsByArea(practiceArea)
    
    if (customTexts) {
      onIntroductionChange(customTexts.introduction_text)
      onTermsChange(customTexts.terms_text)
    } else {
      // Fallback a textos hardcodeados
      const defaultTexts = getHardcodedDefaultTexts(practiceArea)
      onIntroductionChange(defaultTexts.introduction)
      onTermsChange(defaultTexts.terms)
    }
  }

  // Auto-cargar textos por defecto cuando cambia el área de práctica
  useEffect(() => {
    if (practiceArea && (!introduction || !terms)) {
      handleResetTexts()
    }
  }, [practiceArea])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contenido de la Propuesta
        </h3>
        <div className="flex gap-2">
          <DefaultTextsManager />
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetTexts}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Textos por Defecto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Introducción</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="introduction" className="text-sm text-gray-600 mb-2 block">
            Texto de presentación que aparecerá al inicio de la propuesta
          </Label>
          <Textarea
            id="introduction"
            value={introduction}
            onChange={(e) => onIntroductionChange(e.target.value)}
            rows={8}
            placeholder="Escriba aquí la introducción de la propuesta..."
            className="resize-none"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Términos y Condiciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="terms" className="text-sm text-gray-600 mb-2 block">
            Condiciones específicas y términos legales de la prestación del servicio
          </Label>
          <Textarea
            id="terms"
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            rows={10}
            placeholder="Escriba aquí los términos y condiciones..."
            className="resize-none"
          />
        </CardContent>
      </Card>
    </div>
  )
}
