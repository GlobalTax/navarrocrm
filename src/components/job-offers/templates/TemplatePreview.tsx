import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JobOfferFormData } from '@/types/job-offers'
import { NylasTemplate } from './NylasTemplate'
import { ResendTemplate } from './ResendTemplate'
import { PitchTemplate } from './PitchTemplate'

interface TemplatePreviewProps {
  data: JobOfferFormData
}

export function TemplatePreview({ data }: TemplatePreviewProps) {
  const [activeTab, setActiveTab] = useState('resend')

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-manrope font-semibold text-gray-900">
          Plantillas de Integración
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Vista previa de las plantillas para Nylas, Resend y Pitch
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 border-0.5 border-gray-300 rounded-[10px]">
          <TabsTrigger 
            value="resend" 
            className="data-[state=active]:bg-white data-[state=active]:border-0.5 data-[state=active]:border-black data-[state=active]:rounded-[8px]"
          >
            📧 Resend Email
          </TabsTrigger>
          <TabsTrigger 
            value="nylas"
            className="data-[state=active]:bg-white data-[state=active]:border-0.5 data-[state=active]:border-black data-[state=active]:rounded-[8px]"
          >
            📅 Nylas Calendar
          </TabsTrigger>
          <TabsTrigger 
            value="pitch"
            className="data-[state=active]:bg-white data-[state=active]:border-0.5 data-[state=active]:border-black data-[state=active]:rounded-[8px]"
          >
            🎨 Pitch Presentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resend" className="mt-6">
          <ResendTemplate data={data} />
        </TabsContent>

        <TabsContent value="nylas" className="mt-6">
          <NylasTemplate data={data} />
        </TabsContent>

        <TabsContent value="pitch" className="mt-6">
          <PitchTemplate data={data} />
        </TabsContent>
      </Tabs>

      {/* Información de integración */}
      <div className="bg-yellow-50 p-4 rounded-[10px] border-0.5 border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">💡 Información de Integración</h4>
        <div className="text-sm text-yellow-800 space-y-2">
          <p><strong>Resend:</strong> Requiere configurar API key y dominio verificado</p>
          <p><strong>Nylas:</strong> Necesita OAuth setup y configuración de calendario</p>
          <p><strong>Pitch:</strong> Se puede generar como PDF o presentación web interactiva</p>
        </div>
      </div>
    </div>
  )
}