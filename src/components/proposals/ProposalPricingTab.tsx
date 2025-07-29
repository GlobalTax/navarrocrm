import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Calculator, Package } from 'lucide-react'

interface ProposalPricingTabProps {
  proposalId: string
  totalAmount: number
  currency?: string
}

interface ProposalLineItem {
  id: string
  proposal_id: string
  service_catalog_id?: string
  name: string
  description?: string
  quantity: number
  unit_price: number
  total_price: number
  billing_unit: string
  sort_order: number
}

export const ProposalPricingTab = ({ proposalId, totalAmount, currency = 'EUR' }: ProposalPricingTabProps) => {
  const { user } = useApp()

  // Fetch line items for this proposal
  const { data: lineItems = [], isLoading, error } = useQuery({
    queryKey: ['proposal-line-items', proposalId],
    queryFn: async (): Promise<ProposalLineItem[]> => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('proposal_line_items')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!proposalId && !!user?.org_id,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-32" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <div className="text-destructive font-medium mb-2">Error al cargar los precios</div>
        <p className="text-sm text-muted-foreground">No se pudieron cargar los elementos de precio de la propuesta.</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0)
  const taxRate = 0.21 // IVA 21%
  const taxAmount = subtotal * taxRate
  const calculatedTotal = subtotal + taxAmount

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Estructura de Precios</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {lineItems.length} elemento{lineItems.length !== 1 ? 's' : ''}
          </Badge>
          {lineItems.length > 0 && (
            <button
              onClick={async () => {
                try {
                  const proposalPdfData = {
                    proposalId,
                    totalAmount: calculatedTotal,
                    currency,
                    lineItems
                  }

                  const response = await fetch('/functions/v1/generate-proposal-pdf', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(proposalPdfData)
                  })

                  if (!response.ok) {
                    throw new Error('Error generando PDF')
                  }

                  const blob = await response.blob()
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.style.display = 'none'
                  a.href = url
                  a.download = `propuesta-${proposalId}.pdf`
                  document.body.appendChild(a)
                  a.click()
                  window.URL.revokeObjectURL(url)
                  document.body.removeChild(a)
                } catch (error) {
                  console.error('Error descargando PDF:', error)
                  alert('Error al generar el PDF. Por favor, intenta de nuevo.')
                }
              }}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Generar PDF
            </button>
          )}
        </div>
      </div>

      {lineItems.length === 0 ? (
        <div className="bg-card p-12 rounded-lg border shadow-sm text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-lg font-medium mb-2 text-card-foreground">Sin elementos de precio</div>
          <p className="text-sm text-muted-foreground">Esta propuesta no tiene elementos de precio configurados.</p>
        </div>
      ) : (
        <>
          {/* Tabla de line items */}
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Concepto</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Cantidad</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Unidad</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Precio Unit.</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-card-foreground">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center text-card-foreground">
                        {item.quantity}
                      </td>
                      <td className="p-4 text-center text-card-foreground">
                        {item.billing_unit}
                      </td>
                      <td className="p-4 text-right text-card-foreground">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="p-4 text-right font-semibold text-card-foreground">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de totales */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h4 className="text-lg font-semibold mb-4 text-card-foreground">Resumen</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-card-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">IVA (21%):</span>
                <span className="font-medium text-card-foreground">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-card-foreground">Total:</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(calculatedTotal)}</span>
                </div>
              </div>
              
              {/* Verificación de total */}
              {Math.abs(calculatedTotal - totalAmount) > 0.01 && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded text-sm">
                  <div className="font-medium text-warning">Discrepancia detectada</div>
                  <div className="text-muted-foreground">
                    Total calculado: {formatCurrency(calculatedTotal)} | 
                    Total registrado: {formatCurrency(totalAmount)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              <strong>Nota:</strong> Los precios mostrados incluyen todos los conceptos facturables de esta propuesta. 
              El IVA se calcula automáticamente según la legislación vigente (21% general).
            </p>
          </div>
        </>
      )}
    </div>
  )
}