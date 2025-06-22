
import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Download, 
  Zap
} from 'lucide-react'

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
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cuota Recurrente
        </Button>
        <Button 
          variant="outline" 
          onClick={onGenerateInvoices}
          disabled={isGeneratingInvoices}
        >
          <Zap className="w-4 h-4 mr-2" />
          {isGeneratingInvoices ? 'Generando...' : 'Generar Facturas'}
        </Button>
        <Button variant="outline" onClick={onExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>
    </div>
  )
}
