
import React from 'react'
import { Button } from '@/components/ui/button'

interface RecurringFeesActionsProps {
  onNewFee: () => void
  onGenerateInvoices: () => void
  onExportCSV: () => void
  isGeneratingInvoices: boolean
}

export function RecurringFeesActions({ 
  onNewFee, 
  onGenerateInvoices, 
  onExportCSV,
  isGeneratingInvoices 
}: RecurringFeesActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="flex flex-wrap gap-2">
        <Button onClick={onNewFee}>
          Nueva Cuota Recurrente
        </Button>
        <Button 
          variant="outline" 
          onClick={onGenerateInvoices}
          disabled={isGeneratingInvoices}
        >
          {isGeneratingInvoices ? 'Generando...' : 'Generar Facturas'}
        </Button>
        <Button variant="outline" onClick={onExportCSV}>
          Exportar CSV
        </Button>
      </div>
    </div>
  )
}
