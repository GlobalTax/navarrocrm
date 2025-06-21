
import { Button } from '@/components/ui/button'
import { Plus, Upload, Download } from 'lucide-react'

interface ClientsHeaderProps {
  onCreateClient: () => void
  onBulkUpload: () => void
  onExport: () => void
}

export const ClientsHeader = ({ onCreateClient, onBulkUpload, onExport }: ClientsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
        <p className="text-gray-600">Panel completo para la administración de tu cartera de clientes</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button variant="outline" onClick={onBulkUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
        <Button onClick={onCreateClient} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>
    </div>
  )
}
