import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Plus, Trash2 } from 'lucide-react'
import { proposalsLogger } from '@/utils/logging'
import { ProposalFormData, ServiceItemFormData } from '../types/proposal.schema'

interface ServiceManagerProps {
  form: UseFormReturn<ProposalFormData>
  tierIndex: number
  services: ServiceItemFormData[]
  onAddService: () => void
  onRemoveService: (serviceIndex: number) => void
  onCalculateTotal: () => number
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  form,
  tierIndex,
  services,
  onAddService,
  onRemoveService,
  onCalculateTotal
}) => {
  proposalsLogger.debug('ServiceManager renderizado', { tierIndex, servicesCount: services.length })

  const handleQuantityChange = (serviceIndex: number, value: string) => {
    proposalsLogger.debug('Cantidad cambiada para servicio', { serviceIndex, value })
    const numValue = parseFloat(value) || 0
    form.setValue(`pricingTiers.${tierIndex}.services.${serviceIndex}.quantity`, numValue, { shouldValidate: true })
    
    const total = onCalculateTotal()
    proposalsLogger.debug('Nuevo total tras cambio de cantidad', { total })
  }

  const handlePriceChange = (serviceIndex: number, value: string) => {
    proposalsLogger.debug('Precio cambiado para servicio', { serviceIndex, value })
    const numValue = parseFloat(value) || 0
    form.setValue(`pricingTiers.${tierIndex}.services.${serviceIndex}.unitPrice`, numValue, { shouldValidate: true })
    
    const total = onCalculateTotal()
    proposalsLogger.debug('Nuevo total tras cambio de precio', { total })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium">Servicios</h4>
        <Button
          type="button"
          onClick={() => {
            proposalsLogger.debug('Añadiendo nuevo servicio al tier', { tierIndex })
            onAddService()
          }}
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Servicio
        </Button>
      </div>

      {services.map((service, serviceIndex) => {
        const currentQuantity = form.watch(`pricingTiers.${tierIndex}.services.${serviceIndex}.quantity`) || 0
        const currentPrice = form.watch(`pricingTiers.${tierIndex}.services.${serviceIndex}.unitPrice`) || 0
        const subtotal = currentQuantity * currentPrice

        proposalsLogger.debug('Servicio renderizado', { 
          serviceIndex, 
          quantity: currentQuantity, 
          price: currentPrice, 
          subtotal 
        })

        return (
          <Card key={serviceIndex} className="border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Servicio {serviceIndex + 1}</CardTitle>
                {services.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => {
                      proposalsLogger.debug('Eliminando servicio', { serviceIndex, tierIndex })
                      onRemoveService(serviceIndex)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Service Name */}
              <FormField
                control={form.control}
                name={`pricingTiers.${tierIndex}.services.${serviceIndex}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Servicio</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Consultoría Legal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity and Unit Price */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`pricingTiers.${tierIndex}.services.${serviceIndex}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            field.onChange(e)
                            handleQuantityChange(serviceIndex, e.target.value)
                          }}
                          placeholder="1"
                          min="1"
                          step="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`pricingTiers.${tierIndex}.services.${serviceIndex}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Unitario (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            field.onChange(e)
                            handlePriceChange(serviceIndex, e.target.value)
                          }}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Billing Cycle */}
              <FormField
                control={form.control}
                name={`pricingTiers.${tierIndex}.services.${serviceIndex}.billingCycle`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciclo de Facturación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ciclo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="once">Una vez</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name={`pricingTiers.${tierIndex}.services.${serviceIndex}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descripción detallada del servicio..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subtotal */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}