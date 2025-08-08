import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface InvoiceFormDialogProps {
  open: boolean
  onClose: () => void
}

export const InvoiceFormDialog = ({ open, onClose }: InvoiceFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-0.5 border-black rounded-[10px]">
        <DialogHeader>
          <DialogTitle>Nueva Factura</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-muted-foreground text-center">
            Formulario de facturación - Componente en desarrollo
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}