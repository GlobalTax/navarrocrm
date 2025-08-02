import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Plus, Trash2 } from 'lucide-react'
import { proposalsLogger } from '@/utils/logging'
import { ProposalFormData, PricingTierFormData } from '../types/proposal.schema'
import { ServiceManager } from './ServiceManager'

interface PricingTierManagerProps {
  form: UseFormReturn<ProposalFormData>
  pricingTiers: PricingTierFormData[]
  onAddTier: () => void
  onRemoveTier: (index: number) => void
  onAddService: (tierIndex: number) => void
  onRemoveService: (tierIndex: number, serviceIndex: number) => void
  onCalculateTotal: (tierIndex: number) => number
}

export const PricingTierManager: React.FC<PricingTierManagerProps> = ({
  form,
  pricingTiers,
  onAddTier,
  onRemoveTier,
  onAddService,
  onRemoveService,
  onCalculateTotal
}) => {
  proposalsLogger.debug('PricingTierManager renderizado', { tiersCount: pricingTiers.length })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Planes de Precios</h3>
        <Button 
          type="button" 
          onClick={() => {
            proposalsLogger.debug('Añadiendo nuevo tier de precios')
            onAddTier()
          }}
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Plan
        </Button>
      </div>

      {pricingTiers.map((tier, tierIndex) => {
        const tierTotal = onCalculateTotal(tierIndex)
        proposalsLogger.debug('Tier total calculado', { tierIndex, total: tierTotal })

        return (
          <Card key={tierIndex} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Plan {tierIndex + 1}</CardTitle>
                {pricingTiers.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => {
                      proposalsLogger.debug('Eliminando tier', { tierIndex })
                      onRemoveTier(tierIndex)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tier Name */}
              <FormField
                control={form.control}
                name={`pricingTiers.${tierIndex}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Plan</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Plan Básico" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tier Description */}
              <FormField
                control={form.control}
                name={`pricingTiers.${tierIndex}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Descripción del plan..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Services */}
              <ServiceManager
                form={form}
                tierIndex={tierIndex}
                services={tier.services}
                onAddService={() => onAddService(tierIndex)}
                onRemoveService={(serviceIndex) => onRemoveService(tierIndex, serviceIndex)}
                onCalculateTotal={() => onCalculateTotal(tierIndex)}
              />

              {/* Tier Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total del Plan:</span>
                  <span className="font-bold text-xl">€{tierTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}