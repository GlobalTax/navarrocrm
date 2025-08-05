import React from 'react'
import { JobOfferFormData } from '@/types/job-offers'

interface PitchTemplateProps {
  data: JobOfferFormData
}

export function PitchTemplate({ data }: PitchTemplateProps) {
  const formatSalary = (amount?: number, period?: string) => {
    if (!amount) return 'Competitivo'
    const formatted = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
    return `${formatted} ${period === 'annual' ? '/año' : '/mes'}`
  }

  const presentationSlides = [
    {
      title: "¡Te Queremos en Nuestro Equipo!",
      content: `Bienvenido/a ${data.candidate_name}`,
      subtitle: `Propuesta para ${data.title}`,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "🚀"
    },
    {
      title: "Sobre el Puesto",
      content: `
• **Posición:** ${data.title}
• **Departamento:** ${data.department || 'Equipo multidisciplinar'}
• **Nivel:** ${data.position_level === 'junior' ? 'Junior' : 
              data.position_level === 'senior' ? 'Senior' : 
              data.position_level === 'manager' ? 'Manager' : 'Director'}
• **Modalidad:** ${data.work_schedule === 'full_time' ? 'Tiempo completo' : 
                  data.work_schedule === 'part_time' ? 'Tiempo parcial' : 'Híbrido'}
• **Ubicación:** ${data.work_location || 'Oficina central'}
      `,
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "💼"
    },
    {
      title: "Paquete de Compensación",
      content: `
• **Salario:** ${formatSalary(data.salary_amount, data.salary_period)}
• **Vacaciones:** ${data.vacation_days || 22} días al año
• **Período de prueba:** ${data.probation_period_months || 3} meses
• **Trabajo remoto:** ${data.remote_work_allowed ? 'Permitido' : 'Presencial'}
      `,
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: "💰"
    },
    {
      title: "Lo que Harás",
      content: data.responsibilities && data.responsibilities.length > 0 ? 
        data.responsibilities.map(resp => `• ${resp}`).join('\n') :
        `• Contribuir al crecimiento del equipo
• Desarrollar proyectos innovadores
• Colaborar con profesionales expertos
• Crecer profesionalmente`,
      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      icon: "🎯"
    },
    {
      title: "Lo que Buscamos",
      content: data.requirements && data.requirements.length > 0 ? 
        data.requirements.map(req => `• ${req}`).join('\n') :
        `• Pasión por la excelencia
• Mentalidad colaborativa
• Ganas de aprender
• Compromiso con los resultados`,
      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      icon: "✅"
    },
    {
      title: "Beneficios y Más",
      content: data.benefits && data.benefits.length > 0 ? 
        data.benefits.map(benefit => `• ${benefit}`).join('\n') :
        `• Ambiente de trabajo dinámico
• Oportunidades de crecimiento
• Formación continua
• Equipo de trabajo excepcional`,
      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      icon: "🎁"
    },
    {
      title: "Próximos Pasos",
      content: `
• **Fecha de inicio:** ${data.start_date ? new Date(data.start_date).toLocaleDateString('es-ES') : 'A convenir'}
• **Respuesta esperada:** ${data.expires_in_days || 7} días
• **Contacto:** Recursos Humanos
• **Proceso:** Firma → Onboarding → ¡Bienvenido!
      `,
      background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      icon: "📅"
    },
    {
      title: "¡Esperamos tu Respuesta!",
      content: `${data.candidate_name}, estamos emocionados de tenerte en nuestro equipo.`,
      subtitle: data.additional_notes || "Esta es tu oportunidad de brillar con nosotros",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "⭐"
    }
  ]

  return (
    <div className="bg-white p-6 border-0.5 border-black rounded-[10px] space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-manrope font-semibold text-gray-900">
          Plantilla Pitch - Presentación de Oferta
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Presentación visual profesional para la propuesta de trabajo
        </p>
      </div>

      <div className="space-y-4">
        {/* Configuración de la presentación */}
        <div className="bg-purple-50 p-4 rounded-[10px] border-0.5 border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">🎨 Configuración Pitch</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Slides totales:</span> {presentationSlides.length}</p>
            <p><span className="font-medium">Tema:</span> Profesional con gradientes</p>
            <p><span className="font-medium">Fuente:</span> Manrope, sans-serif</p>
            <p><span className="font-medium">Resolución:</span> 1920x1080 (16:9)</p>
          </div>
        </div>

        {/* Vista previa de slides */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {presentationSlides.map((slide, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg border-0.5 border-gray-300 overflow-hidden text-white text-xs p-3"
              style={{
                background: slide.background,
                transform: 'scale(0.8)',
                transformOrigin: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                <div className="text-2xl mb-1">{slide.icon}</div>
                <h5 className="font-bold text-sm mb-1">{slide.title}</h5>
                {slide.subtitle && (
                  <p className="text-xs opacity-90">{slide.subtitle}</p>
                )}
                <div className="text-xs mt-1 opacity-75 max-w-full overflow-hidden">
                  {slide.content.split('\n').slice(0, 3).map((line, i) => (
                    <div key={i} className="truncate">{line}</div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 text-xs opacity-60">
                {index + 1}/{presentationSlides.length}
              </div>
            </div>
          ))}
        </div>

        {/* Elementos interactivos */}
        <div className="bg-green-50 p-4 rounded-[10px] border-0.5 border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">🎯 Elementos Interactivos</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Animaciones:</span> Fade in, slide transitions</p>
            <p><span className="font-medium">Duración:</span> ~10 minutos de presentación</p>
            <p><span className="font-medium">Formatos:</span> PDF, PowerPoint, Web</p>
            <p><span className="font-medium">Compartir:</span> Link directo, descarga</p>
          </div>
        </div>

        {/* Notas del presentador */}
        <div className="bg-blue-50 p-4 rounded-[10px] border-0.5 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📝 Notas del Presentador</h4>
          <div className="text-sm space-y-2">
            <p><strong>Slide 1:</strong> Dar la bienvenida cálida y personal</p>
            <p><strong>Slide 2-3:</strong> Enfocarse en el valor del puesto</p>
            <p><strong>Slide 4-6:</strong> Destacar el crecimiento profesional</p>
            <p><strong>Slide 7:</strong> Crear sentido de urgencia positiva</p>
            <p><strong>Slide 8:</strong> Terminar con entusiasmo y próximos pasos claros</p>
          </div>
        </div>
      </div>

      {/* JSON para desarrollador */}
      <details className="pt-4 border-t border-gray-200">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">Ver estructura de slides</summary>
        <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
          {JSON.stringify(presentationSlides, null, 2)}
        </pre>
      </details>
    </div>
  )
}