import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface QuantumImportDialogProps {
  open: boolean
  onClose: () => void
}

export function QuantumImportDialog({ open, onClose }: QuantumImportDialogProps) {
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle')

  const handleImport = async () => {
    setImportStatus('importing')
    // Simulate import process
    setTimeout(() => {
      setImportStatus('success')
      setTimeout(() => {
        onClose()
        setImportStatus('idle')
      }, 2000)
    }, 3000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importación Quantum - Contactos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Importación Avanzada de Contactos</h3>
            <p className="text-sm text-blue-700">
              Esta función permite importar contactos desde múltiples fuentes con validación automática y detección de duplicados.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium">Plantilla Excel</div>
                  <div className="text-sm text-gray-500">Formato estándar para importación</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Arrastra tu archivo aquí</h3>
              <p className="text-gray-500 mb-4">O haz clic para seleccionar un archivo</p>
              <Button variant="outline">
                Seleccionar archivo
              </Button>
            </div>
          </div>

          {importStatus === 'importing' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <div>
                <div className="font-medium text-blue-900">Importando contactos...</div>
                <div className="text-sm text-blue-700">Procesando y validando datos</div>
              </div>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Importación completada</div>
                <div className="text-sm text-green-700">Se han importado 150 contactos exitosamente</div>
              </div>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-red-900">Error en la importación</div>
                <div className="text-sm text-red-700">Se encontraron errores en el archivo</div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport}
              disabled={importStatus === 'importing'}
            >
              {importStatus === 'importing' ? 'Importando...' : 'Comenzar Importación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}