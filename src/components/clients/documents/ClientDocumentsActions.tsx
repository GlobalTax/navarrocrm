
import { Button } from '@/components/ui/button'
import { Upload, FileText, FileCheck } from 'lucide-react'

export const ClientDocumentsActions = () => {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" className="gap-2">
        <Upload className="h-4 w-4" />
        Subir Documento
      </Button>
      <Button size="sm" variant="outline" className="gap-2">
        <FileText className="h-4 w-4" />
        Nueva Propuesta
      </Button>
      <Button size="sm" variant="outline" className="gap-2">
        <FileCheck className="h-4 w-4" />
        Nuevo Contrato
      </Button>
    </div>
  )
}
