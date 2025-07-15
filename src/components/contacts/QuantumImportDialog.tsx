import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QuantumClientImporter } from '@/components/quantum/QuantumClientImporter'

interface QuantumImportDialogProps {
  open: boolean
  onClose: () => void
}

export function QuantumImportDialog({ open, onClose }: QuantumImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden border-0.5 border-black rounded-[10px]">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold">
            Importar desde Quantum Economics
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <QuantumClientImporter type="clients" />
        </div>
      </DialogContent>
    </Dialog>
  )
}