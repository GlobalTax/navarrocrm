
import React from 'react'
import { ProposalData } from '@/hooks/useProposalProfessional'

interface ProposalPreviewFormalProps {
  formData: ProposalData
  clientName?: string
  totals: { subtotal: number; ivaAmount: number; total: number }
}

export const ProposalPreviewFormal: React.FC<ProposalPreviewFormalProps> = ({
  formData,
  clientName,
  totals
}) => {
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const firstName = clientName?.split(' ')[0] || 'Cliente'

  return (
    <div className="max-w-4xl mx-auto bg-white text-black" style={{ fontFamily: "'Manrope', Arial, Helvetica, sans-serif" }}>
      {/* Header */}
      <div className="px-10 pt-10 pb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold">
              {formData.companyName}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Asesores Legales y Tributarios
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Barcelona</p>
          </div>
        </div>

        <div className="border-b-2 border-black mb-6" />

        <h1 className="text-center text-lg font-bold tracking-wide mb-6" style={{ letterSpacing: '0.05em' }}>
          PROPUESTA DE HONORARIOS PROFESIONALES
        </h1>

        <div className="text-sm mb-6 space-y-1">
          <p>En Barcelona, a {today}</p>
          {clientName && <p className="mt-2"><strong>Re:</strong> {clientName}</p>}
          {formData.projectReference && (
            <p><strong>Ref.:</strong> <em className="font-semibold">{formData.projectReference}</em></p>
          )}
        </div>

        {/* Saludo */}
        <p className="mb-4">Estimado Sr./Sra. {firstName}:</p>
        <p className="text-justify leading-relaxed mb-6">
          {formData.introduction || 'De acuerdo con nuestra reciente reunión y su solicitud de colaboración, tenemos el gusto de remitirles la presente propuesta de servicios profesionales.'}
        </p>
      </div>

      {/* Sección 1: Información General */}
      <div className="px-10 mb-6">
        <h2 className="text-base font-bold mb-3">
          1. Información General sobre {formData.companyName}
        </h2>
        <p className="text-justify leading-relaxed text-sm">
          {formData.companyDescription}
        </p>
      </div>

      {/* Sección 2: Alcance */}
      <div className="px-10 mb-6">
        <h2 className="text-base font-bold mb-3">
          2. Alcance de Nuestra Colaboración
        </h2>
        <p className="text-sm mb-4 text-justify leading-relaxed">
          Nuestra colaboración se estructurará por fases, permitiendo un enfoque modular y adaptado al progreso del proyecto:
        </p>

        {formData.phases.map((phase, index) => (
          <div key={phase.id} className="mb-5 ml-4">
            <h3 className="font-bold text-sm mb-2">
              Fase {index + 1} – {phase.name}
              {phase.estimatedDuration && <span className="font-normal text-gray-600"> ({phase.estimatedDuration})</span>}
            </h3>
            {phase.description && (
              <p className="text-sm text-justify leading-relaxed mb-2">{phase.description}</p>
            )}
            {phase.deliverables.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-semibold">Entregables:</p>
                <ul className="list-disc list-inside ml-4 text-sm">
                  {phase.deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
            {phase.services.length > 0 && (
              <div>
                <p className="text-sm font-semibold">Servicios:</p>
                <ul className="list-disc list-inside ml-4 text-sm">
                  {phase.services.map((s) => (
                    <li key={s.id}>{s.name}{s.description ? `: ${s.description}` : ''}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sección 3: Equipo */}
      {formData.team.length > 0 && (
        <div className="px-10 mb-6">
          <h2 className="text-base font-bold mb-3">
            3. Equipo Responsable
          </h2>
          <p className="text-sm mb-3 text-justify">
            Para la prestación de estos servicios, {formData.companyName} asignará un equipo multidisciplinar:
          </p>
          <ul className="list-disc list-inside ml-4 text-sm space-y-1">
            {formData.team.map((m) => (
              <li key={m.id}>
                <strong>{m.role}:</strong> {m.name}
                {m.experience && <span className="text-gray-600"> — {m.experience}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sección 4: Honorarios */}
      <div className="px-10 mb-6">
        <h2 className="text-base font-bold mb-3">
          4. Honorarios Profesionales
        </h2>
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 pr-4">Fase</th>
              <th className="text-right py-2 px-4">Importe</th>
              <th className="text-left py-2 pl-4">Condiciones de Pago</th>
            </tr>
          </thead>
          <tbody>
            {formData.phases.map((phase, index) => {
              const phaseTotal = phase.services.reduce((t, s) => t + s.total, 0)
              return (
                <tr key={phase.id} className="border-b border-gray-300">
                  <td className="py-2 pr-4">Fase {index + 1} – {phase.name}</td>
                  <td className="py-2 px-4 text-right">{phaseTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                  <td className="py-2 pl-4">{phase.paymentPercentage}% inicio / {100 - phase.paymentPercentage}% finalización</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td className="py-2 pr-4">SUBTOTAL</td>
              <td className="py-2 px-4 text-right">{totals.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
              <td className="py-2 pl-4">—</td>
            </tr>
            <tr>
              <td className="py-1 pr-4">IVA ({formData.iva}%)</td>
              <td className="py-1 px-4 text-right">{totals.ivaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
              <td className="py-1 pl-4">—</td>
            </tr>
            <tr className="border-t-2 border-black font-bold text-base">
              <td className="py-2 pr-4">TOTAL</td>
              <td className="py-2 px-4 text-right">{totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
              <td className="py-2 pl-4">—</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Sección 5: Gastos */}
      <div className="px-10 mb-6">
        <h2 className="text-base font-bold mb-3">
          5. Gastos y Suplidos
        </h2>
        <p className="text-sm text-justify leading-relaxed">
          {formData.expensesIncluded
            ? 'Los gastos y suplidos están incluidos en los honorarios anteriores.'
            : 'Los gastos y suplidos (aranceles notariales, registrales, tasas, etc.) no están incluidos en los honorarios y correrán a cargo del cliente, previa justificación.'}
        </p>
      </div>

      {/* Sección 6: Confidencialidad */}
      {formData.confidentialityClause && (
        <div className="px-10 mb-6">
          <h2 className="text-base font-bold mb-3">
            6. Confidencialidad
          </h2>
          <p className="text-sm text-justify leading-relaxed">
            {formData.companyName} se compromete a mantener la más estricta confidencialidad sobre toda la información y documentación facilitada por el cliente, de conformidad con la normativa vigente en materia de protección de datos y con nuestro código deontológico profesional.
          </p>
        </div>
      )}

      {/* Sección 7: Duración */}
      <div className="px-10 mb-6">
        <h2 className="text-base font-bold mb-3">
          7. Duración y Modificación
        </h2>
        <p className="text-sm text-justify leading-relaxed">
          La presente Propuesta tendrá una validez de {formData.validityDays} días desde la fecha de emisión.
          La colaboración se iniciará formalmente tras la recepción de una copia de esta Propuesta debidamente firmada.
          Cualquier modificación del alcance de los servicios será acordada por escrito entre ambas partes.
        </p>
      </div>

      {/* Bloque de Aceptación */}
      <div className="px-10 mb-8 mt-10">
        <div className="border-t-2 border-black pt-6">
          <p className="text-sm text-center mb-8">
            Reciban un cordial saludo,
          </p>
          <p className="text-center font-bold text-sm mb-10">{formData.companyName}</p>

          <div className="mt-12 pt-6 border-t border-gray-400">
            <p className="text-sm font-bold mb-6 text-center">
              ACEPTACIÓN DE LA PROPUESTA
            </p>
            <div className="grid grid-cols-2 gap-16 mt-8">
              <div className="text-center text-sm">
                <p className="mb-1">Por {formData.companyName}</p>
                <div className="border-b border-black mt-16 mb-2" />
                <p className="text-xs text-gray-500">Firma y sello</p>
              </div>
              <div className="text-center text-sm">
                <p className="mb-1">Por el Cliente</p>
                <div className="border-b border-black mt-16 mb-2" />
                <p className="text-xs text-gray-500">Firma y sello</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-6">
              Fecha: _____ / _____ / _____
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
