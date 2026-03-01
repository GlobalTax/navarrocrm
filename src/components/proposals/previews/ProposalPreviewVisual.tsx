
import React from 'react'
import { ProposalData } from '@/hooks/useProposalProfessional'

interface ProposalPreviewVisualProps {
  formData: ProposalData
  clientName?: string
  totals: { subtotal: number; ivaAmount: number; total: number }
}

const darkGreen = '#1a3a2a'
const lightBg = '#f5f1eb'

export const ProposalPreviewVisual: React.FC<ProposalPreviewVisualProps> = ({
  formData,
  clientName,
  totals
}) => {
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="max-w-4xl mx-auto" style={{ fontFamily: "'Manrope', Arial, Helvetica, sans-serif" }}>
      {/* PORTADA */}
      <div
        className="p-12 mb-1 min-h-[400px] flex flex-col justify-between"
        style={{ backgroundColor: lightBg }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: darkGreen, opacity: 0.6 }}>
            {formData.companyName}
          </p>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: darkGreen }}>
            {formData.title || 'Propuesta de Servicios Profesionales'}
          </h1>
          {formData.projectReference && (
            <p className="text-lg mb-2" style={{ color: darkGreen, opacity: 0.7 }}>
              {formData.projectReference}
            </p>
          )}
          {clientName && (
            <p className="text-base" style={{ color: darkGreen, opacity: 0.5 }}>
              Preparado para: {clientName}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm" style={{ color: darkGreen, opacity: 0.5 }}>
            {today}
          </p>
        </div>
      </div>

      {/* ÍNDICE */}
      <div className="px-12 py-10 bg-white mb-1">
        <h2 className="text-2xl font-bold mb-6" style={{ color: darkGreen }}>Índice</h2>
        <div className="space-y-3">
          {[
            'Sobre nosotros',
            'Alcance del proyecto',
            ...(formData.team.length > 0 ? ['Equipo responsable'] : []),
            'Propuesta económica',
            'Términos y condiciones',
            'Aceptación'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span
                className="text-2xl font-bold w-8"
                style={{ color: darkGreen, opacity: 0.3 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-base" style={{ color: darkGreen }}>{item}</span>
              <div className="flex-1 border-b border-dashed" style={{ borderColor: `${darkGreen}33` }} />
            </div>
          ))}
        </div>
      </div>

      {/* SOBRE NOSOTROS */}
      <div className="px-12 py-10 bg-white mb-1">
        <div className="flex gap-8">
          <div
            className="w-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: darkGreen }}
          />
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: darkGreen, opacity: 0.5 }}>01</p>
            <h2 className="text-2xl font-bold mb-4" style={{ color: darkGreen }}>
              Sobre {formData.companyName}
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              {formData.companyDescription}
            </p>
          </div>
        </div>
      </div>

      {/* ALCANCE - FASES */}
      <div className="px-12 py-10 bg-white mb-1">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: darkGreen, opacity: 0.5 }}>02</p>
        <h2 className="text-2xl font-bold mb-6" style={{ color: darkGreen }}>
          Alcance del Proyecto
        </h2>
        {formData.introduction && (
          <p className="text-sm leading-relaxed text-gray-700 mb-6">{formData.introduction}</p>
        )}

        <div className="space-y-6">
          {formData.phases.map((phase, index) => (
            <div
              key={phase.id}
              className="p-6 rounded-lg"
              style={{ backgroundColor: lightBg }}
            >
              <div className="flex items-start gap-4">
                <span
                  className="text-3xl font-bold flex-shrink-0"
                  style={{ color: darkGreen, opacity: 0.2 }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1" style={{ color: darkGreen }}>
                    {phase.name}
                  </h3>
                  {phase.estimatedDuration && (
                    <p className="text-xs text-gray-500 mb-2">{phase.estimatedDuration}</p>
                  )}
                  {phase.description && (
                    <p className="text-sm text-gray-700 mb-3">{phase.description}</p>
                  )}
                  {phase.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {phase.deliverables.map((d, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${darkGreen}15`, color: darkGreen }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EQUIPO */}
      {formData.team.length > 0 && (
        <div className="px-12 py-10 bg-white mb-1">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: darkGreen, opacity: 0.5 }}>03</p>
          <h2 className="text-2xl font-bold mb-6" style={{ color: darkGreen }}>
            Equipo Responsable
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {formData.team.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-lg"
                style={{ backgroundColor: lightBg }}
              >
                <p className="font-bold text-sm" style={{ color: darkGreen }}>{m.name || '—'}</p>
                <p className="text-xs text-gray-600">{m.role}</p>
                {m.experience && <p className="text-xs text-gray-500 mt-1">{m.experience}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROPUESTA ECONÓMICA */}
      <div className="px-12 py-10 bg-white mb-1">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: darkGreen, opacity: 0.5 }}>
          {formData.team.length > 0 ? '04' : '03'}
        </p>
        <h2 className="text-2xl font-bold mb-6" style={{ color: darkGreen }}>
          Propuesta Económica
        </h2>

        <div className="space-y-3 mb-6">
          {formData.phases.map((phase, index) => {
            const phaseTotal = phase.services.reduce((t, s) => t + s.total, 0)
            return (
              <div key={phase.id} className="flex items-center justify-between py-3 border-b" style={{ borderColor: `${darkGreen}15` }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: darkGreen }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: darkGreen }}>Fase {index + 1}: {phase.name}</p>
                    <p className="text-xs text-gray-500">
                      {phase.paymentPercentage}% inicio / {100 - phase.paymentPercentage}% fin
                    </p>
                  </div>
                </div>
                <p className="text-base font-bold" style={{ color: darkGreen }}>
                  {phaseTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>
            )
          })}
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: darkGreen }}>
          <div className="flex justify-between text-white text-sm mb-2 opacity-80">
            <span>Subtotal</span>
            <span>{totals.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="flex justify-between text-white text-sm mb-3 opacity-80">
            <span>IVA ({formData.iva}%)</span>
            <span>{totals.ivaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="border-t border-white/30 pt-3">
            <div className="flex justify-between text-white text-xl font-bold">
              <span>Total</span>
              <span>{totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* TÉRMINOS */}
      <div className="px-12 py-10 bg-white mb-1">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: darkGreen, opacity: 0.5 }}>
          {formData.team.length > 0 ? '05' : '04'}
        </p>
        <h2 className="text-2xl font-bold mb-4" style={{ color: darkGreen }}>
          Términos y Condiciones
        </h2>
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            <strong>Validez:</strong> Esta propuesta tiene una validez de {formData.validityDays} días desde la fecha de emisión.
          </p>
          <p>
            <strong>Condiciones de pago:</strong> {formData.paymentTerms}
          </p>
          <p>
            <strong>Gastos:</strong>{' '}
            {formData.expensesIncluded
              ? 'Incluidos en los honorarios.'
              : 'Los gastos y suplidos correrán a cargo del cliente, previa justificación.'}
          </p>
          {formData.confidentialityClause && (
            <p>
              <strong>Confidencialidad:</strong> {formData.companyName} garantiza la total confidencialidad de la información facilitada.
            </p>
          )}
        </div>
      </div>

      {/* ACEPTACIÓN */}
      <div className="px-12 py-10 bg-white mb-1">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: darkGreen, opacity: 0.5 }}>
          {formData.team.length > 0 ? '06' : '05'}
        </p>
        <h2 className="text-2xl font-bold mb-6" style={{ color: darkGreen }}>
          Aceptación
        </h2>
        <p className="text-sm text-gray-700 mb-8">
          Para formalizar la aceptación de esta propuesta, rogamos nos devuelvan una copia firmada de este documento.
        </p>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <p className="text-xs text-gray-500 mb-1">Por {formData.companyName}</p>
            <div className="border-b-2 mt-16 mb-2" style={{ borderColor: darkGreen }} />
            <p className="text-xs text-gray-400">Firma y sello</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Por el Cliente</p>
            <div className="border-b-2 mt-16 mb-2" style={{ borderColor: darkGreen }} />
            <p className="text-xs text-gray-400">Firma y sello</p>
          </div>
        </div>
      </div>

      {/* CIERRE */}
      <div
        className="px-12 py-16 text-center"
        style={{ backgroundColor: darkGreen }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">Gracias</h2>
        <p className="text-white/60 text-sm">{formData.companyName}</p>
        <p className="text-white/40 text-xs mt-2">Asesores Legales y Tributarios</p>
      </div>
    </div>
  )
}
