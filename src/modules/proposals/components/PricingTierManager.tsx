
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import { ProposalFormData, PricingTierFormData } from '../types/proposal.schema';
import { ServiceManager } from './ServiceManager';

interface PricingTierManagerProps {
  form: UseFormReturn<ProposalFormData>;
  pricingTiers: PricingTierFormData[];
  onAddTier: () => void;
  onRemoveTier: (index: number) => void;
  onAddService: (tierIndex: number) => void;
  onRemoveService: (tierIndex: number, serviceIndex: number) => void;
  onCalculateTotal: (tierIndex: number) => number;
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
  console.log('PricingTierManager rendering with', pricingTiers.length, 'tiers');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Planes de Precios</h3>
        <Button 
          type="button" 
          onClick={() => {
            console.log('Adding new pricing tier');
            onAddTier();
          }} 
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Plan
        </Button>
      </div>

      {pricingTiers.map((tier, tierIndex) => {
        const tierTotal = onCalculateTotal(tierIndex);
        console.log(`Tier ${tierIndex} total:`, tierTotal);

        return (
          <Card key={tier.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Plan {tierIndex + 1}: {tier.name || 'Sin nombre'}
                </CardTitle>
                {pricingTiers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('Removing tier', tierIndex);
                      onRemoveTier(tierIndex);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`pricingTiers.${tierIndex}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Plan *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Plan Básico" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`pricingTiers.${tierIndex}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Descripción del plan" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <ServiceManager
                form={form}
                tierIndex={tierIndex}
                services={tier.services || []}
                onAddService={() => onAddService(tierIndex)}
                onRemoveService={(serviceIndex) => onRemoveService(tierIndex, serviceIndex)}
                onCalculateTotal={() => onCalculateTotal(tierIndex)}
              />

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total del Plan:</span>
                  <span className="text-lg font-bold">
                    {tierTotal.toFixed(2)} {form.watch('currency') || 'EUR'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
