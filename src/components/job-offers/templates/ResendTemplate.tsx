import React from 'react'
import { JobOfferFormData } from '@/types/job-offers'

interface ResendTemplateProps {
  data: JobOfferFormData
}

export function ResendTemplate({ data }: ResendTemplateProps) {
  const formatSalary = (amount?: number, period?: string) => {
    if (!amount) return 'A negociar'
    const formatted = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
    return `${formatted} ${period === 'annual' ? 'anuales' : 'mensuales'}`
  }

  const emailTemplate = {
    subject: `Oferta de trabajo: ${data.title} - ${data.department || 'Nuestra empresa'}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oferta de Trabajo</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; border: 0.5px solid #000; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; padding: 20px; background: #f8f9fa; border: 0.5px solid #e9ecef; border-radius: 10px; }
        .highlight { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 5px; }
        .benefits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
        .benefit-item { background: white; padding: 10px; border-radius: 5px; border: 1px solid #e0e0e0; }
        .footer { background: #f1f3f4; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .cta-button { display: inline-block; background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀</div>
            <h1>¡Tenemos una propuesta para ti!</h1>
            <p>Estimado/a ${data.candidate_name}</p>
        </div>
        
        <div class="content">
            <p>Nos complace presentarte nuestra oferta para el puesto de <strong>${data.title}</strong> en nuestro equipo${data.department ? ` de ${data.department}` : ''}.</p>
            
            <div class="section">
                <h3>📋 Detalles del Puesto</h3>
                <div style="display: grid; gap: 10px;">
                    <div><strong>Posición:</strong> ${data.title}</div>
                    ${data.department ? `<div><strong>Departamento:</strong> ${data.department}</div>` : ''}
                    <div><strong>Nivel:</strong> ${data.position_level === 'junior' ? 'Junior' : 
                                                  data.position_level === 'senior' ? 'Senior' : 
                                                  data.position_level === 'manager' ? 'Manager' : 'Director'}</div>
                    <div><strong>Modalidad:</strong> ${data.work_schedule === 'full_time' ? 'Tiempo completo' : 
                                                     data.work_schedule === 'part_time' ? 'Tiempo parcial' : 'Híbrido'}</div>
                    ${data.work_location ? `<div><strong>Ubicación:</strong> ${data.work_location}</div>` : ''}
                </div>
            </div>

            <div class="highlight">
                <h3>💰 Compensación</h3>
                <div style="font-size: 18px; font-weight: bold; color: #2196f3;">
                    ${formatSalary(data.salary_amount, data.salary_period)}
                </div>
                <p style="margin: 10px 0 0 0; font-size: 14px;">
                    ${data.vacation_days ? `${data.vacation_days} días de vacaciones` : ''}
                    ${data.probation_period_months ? ` • ${data.probation_period_months} meses de período de prueba` : ''}
                </p>
            </div>

            ${data.responsibilities && data.responsibilities.length > 0 ? `
            <div class="section">
                <h3>🎯 Responsabilidades</h3>
                <ul>
                    ${data.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${data.requirements && data.requirements.length > 0 ? `
            <div class="section">
                <h3>✅ Requisitos</h3>
                <ul>
                    ${data.requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${data.benefits && data.benefits.length > 0 ? `
            <div class="section">
                <h3>🎁 Beneficios</h3>
                <div class="benefits-grid">
                    ${data.benefits.map(benefit => `<div class="benefit-item">✓ ${benefit}</div>`).join('')}
                </div>
            </div>
            ` : ''}

            ${data.additional_notes ? `
            <div class="section">
                <h3>📝 Información Adicional</h3>
                <p>${data.additional_notes}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
                <a href="{OFFER_LINK}" class="cta-button">Ver Oferta Completa</a>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    Esta oferta expira en ${data.expires_in_days || 7} días
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p><strong>Equipo de Recursos Humanos</strong></p>
            <p style="font-size: 12px; margin-top: 15px;">
                Este email es confidencial y está dirigido únicamente a ${data.candidate_name}
            </p>
        </div>
    </div>
</body>
</html>
    `,
    text: `
Oferta de trabajo: ${data.title}

Estimado/a ${data.candidate_name},

Nos complace presentarte nuestra oferta para el puesto de ${data.title}${data.department ? ` en el departamento de ${data.department}` : ''}.

DETALLES DEL PUESTO:
- Posición: ${data.title}
${data.department ? `- Departamento: ${data.department}` : ''}
- Nivel: ${data.position_level}
- Modalidad: ${data.work_schedule}
${data.work_location ? `- Ubicación: ${data.work_location}` : ''}

COMPENSACIÓN:
${formatSalary(data.salary_amount, data.salary_period)}
${data.vacation_days ? `${data.vacation_days} días de vacaciones` : ''}
${data.probation_period_months ? `${data.probation_period_months} meses de período de prueba` : ''}

${data.responsibilities && data.responsibilities.length > 0 ? `
RESPONSABILIDADES:
${data.responsibilities.map(resp => `- ${resp}`).join('\n')}
` : ''}

${data.requirements && data.requirements.length > 0 ? `
REQUISITOS:
${data.requirements.map(req => `- ${req}`).join('\n')}
` : ''}

${data.benefits && data.benefits.length > 0 ? `
BENEFICIOS:
${data.benefits.map(benefit => `- ${benefit}`).join('\n')}
` : ''}

Para ver la oferta completa y responder, visita: {OFFER_LINK}

Esta oferta expira en ${data.expires_in_days || 7} días.

Saludos,
Equipo de Recursos Humanos
    `
  }

  return (
    <div className="bg-white p-6 border-0.5 border-black rounded-[10px] space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-manrope font-semibold text-gray-900">
          Plantilla Resend - Email de Oferta
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Template profesional para envío de ofertas de trabajo
        </p>
      </div>

      <div className="space-y-4">
        {/* Vista previa del subject */}
        <div className="bg-blue-50 p-4 rounded-[10px] border-0.5 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📧 Asunto del Email</h4>
          <p className="text-sm font-medium">{emailTemplate.subject}</p>
        </div>

        {/* Vista previa del contenido */}
        <div className="bg-gray-50 p-4 rounded-[10px] border-0.5 border-gray-200 max-h-96 overflow-y-auto">
          <h4 className="font-semibold text-gray-900 mb-2">📋 Vista Previa HTML</h4>
          <div 
            className="text-xs bg-white p-3 rounded border"
            style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%' }}
            dangerouslySetInnerHTML={{ __html: emailTemplate.html }}
          />
        </div>

        {/* Configuraciones */}
        <div className="bg-green-50 p-4 rounded-[10px] border-0.5 border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">⚙️ Configuración Resend</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">From:</span> Recursos Humanos &lt;hr@empresa.com&gt;</p>
            <p><span className="font-medium">To:</span> {data.candidate_email}</p>
            <p><span className="font-medium">Reply-To:</span> hr@empresa.com</p>
            <p><span className="font-medium">Tags:</span> job-offer, recruitment</p>
          </div>
        </div>
      </div>

      {/* JSON para desarrollador */}
      <details className="pt-4 border-t border-gray-200">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">Ver JSON del template</summary>
        <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
          {JSON.stringify(emailTemplate, null, 2)}
        </pre>
      </details>
    </div>
  )
}