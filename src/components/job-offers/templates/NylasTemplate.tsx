import React from 'react'
import { JobOfferFormData } from '@/types/job-offers'

interface NylasTemplateProps {
  data: JobOfferFormData
}

export function NylasTemplate({ data }: NylasTemplateProps) {
  // Template para crear evento de calendario automáticamente cuando se acepta la oferta
  const generateCalendarEvent = () => {
    return {
      title: `Primer día de trabajo - ${data.candidate_name}`,
      description: `
Bienvenida para ${data.candidate_name}
Puesto: ${data.title}
Departamento: ${data.department || 'No especificado'}
Modalidad: ${data.work_schedule === 'full_time' ? 'Tiempo completo' : 
           data.work_schedule === 'part_time' ? 'Tiempo parcial' : 'Híbrido'}

Preparativos necesarios:
- Configurar equipo de trabajo
- Accesos y credenciales
- Tour por las instalaciones
- Reunión con el equipo
      `,
      start_time: data.start_date ? new Date(data.start_date).toISOString() : null,
      end_time: data.start_date ? new Date(new Date(data.start_date).getTime() + 2 * 60 * 60 * 1000).toISOString() : null, // 2 horas después
      attendees: [
        data.candidate_email,
        // Agregar emails del equipo HR/manager aquí
      ],
      location: data.work_location || 'Oficina principal',
      reminders: [
        { minutes: 1440 }, // 1 día antes
        { minutes: 60 }    // 1 hora antes
      ]
    }
  }

  // Template para seguimiento post-aceptación
  const generateFollowUpEvents = () => {
    const startDate = new Date(data.start_date || Date.now())
    
    return [
      {
        title: `Check-in semana 1 - ${data.candidate_name}`,
        description: 'Revisión del primer período de adaptación',
        start_time: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        attendees: [data.candidate_email]
      },
      {
        title: `Evaluación primer mes - ${data.candidate_name}`,
        description: 'Evaluación del período de prueba',
        start_time: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        attendees: [data.candidate_email]
      }
    ]
  }

  return (
    <div className="bg-white p-6 border-0.5 border-black rounded-[10px] space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-manrope font-semibold text-gray-900">
          Plantilla Nylas - Gestión de Calendario
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Eventos automáticos para el proceso de incorporación
        </p>
      </div>

      <div className="space-y-6">
        {/* Evento principal */}
        <div className="bg-blue-50 p-4 rounded-[10px] border-0.5 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📅 Primer día de trabajo</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Título:</span> Primer día de trabajo - {data.candidate_name}</p>
            <p><span className="font-medium">Fecha:</span> {data.start_date || 'Por definir'}</p>
            <p><span className="font-medium">Duración:</span> 2 horas</p>
            <p><span className="font-medium">Ubicación:</span> {data.work_location || 'Oficina principal'}</p>
            <p><span className="font-medium">Invitados:</span> {data.candidate_email}</p>
          </div>
        </div>

        {/* Eventos de seguimiento */}
        <div className="bg-green-50 p-4 rounded-[10px] border-0.5 border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">🔄 Seguimiento automático</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Check-in semana 1</span>
              <span className="text-green-700">+7 días</span>
            </div>
            <div className="flex justify-between">
              <span>Evaluación primer mes</span>
              <span className="text-green-700">+30 días</span>
            </div>
          </div>
        </div>

        {/* Configuración */}
        <div className="bg-gray-50 p-4 rounded-[10px] border-0.5 border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">⚙️ Configuración</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Recordatorios:</span> 1 día y 1 hora antes</p>
            <p><span className="font-medium">Sincronización:</span> Automática con aceptación de oferta</p>
            <p><span className="font-medium">Zona horaria:</span> Europe/Madrid</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
          {JSON.stringify(generateCalendarEvent(), null, 2)}
        </code>
      </div>
    </div>
  )
}