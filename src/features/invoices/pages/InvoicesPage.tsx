import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoicesList } from '../components/InvoicesList'
import { InvoiceFilters } from '../components/InvoiceFilters'
import { InvoiceFormDialog } from '../components/InvoiceFormDialog'
import { useInvoicesList } from '../hooks'

export default function InvoicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { invoices, isLoading } = useInvoicesList()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Facturación</h1>
          <p className="text-muted-foreground">
            Gestiona facturas y pagos
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="border-0.5 border-black rounded-[10px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      <InvoiceFilters />
      
      <InvoicesList 
        invoices={invoices} 
        isLoading={isLoading}
      />

      <InvoiceFormDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  )
}