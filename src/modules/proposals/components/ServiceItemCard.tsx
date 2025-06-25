
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ProposalFormData, ServiceItemFormData } from '../types/proposal.schema';
import { ServiceFormFields } from './ServiceFormFields';

interface ServiceItemCardProps {
  form: UseFormReturn<ProposalFormData>;
  tierIndex: number;
  serviceIndex: number;
  service: ServiceItemFormData;
  servicesLength: number;
  onRemoveService: () => void;
  onCalculateTotal: () => number;
}

export const ServiceItemCard: React.FC<ServiceItemCardProps> = ({
  form,
  tierIndex,
  serviceIndex,
  service,
  servicesLength,
  onRemoveService,
  onCalculateTotal
}) => {
  const currentQuantity = form.watch(`pricingTiers.${tierIndex}.services.${serviceIndex}.quantity`) || 1;
  const currentPrice = form.watch(`pricingTiers.${tierIndex}.services.${serviceIndex}.unitPrice`) || 0;
  const subtotal = currentQuantity * currentPrice;

  console.log(`Service ${serviceIndex} - Quantity: ${currentQuantity}, Price: ${currentPrice}, Subtotal: ${subtotal}`);

  const handleQuantityChange = (value: string) => {
    console.log('Quantity changed for service', serviceIndex, ':', value);
    const numValue = parseInt(value) || 1;
    form.setValue(`pricingTiers.${tierIndex}.services.${serviceIndex}.quantity`, numValue);
    // Trigger recalculation after a short delay to ensure form is updated
    setTimeout(() => {
      const total = onCalculateTotal();
      console.log('New total after quantity change:', total);
    }, 100);
  };

  const handlePriceChange = (value: string) => {
    console.log('Price changed for service', serviceIndex, ':', value);
    const numValue = parseFloat(value) || 0;
    form.setValue(`pricingTiers.${tierIndex}.services.${serviceIndex}.unitPrice`, numValue);
    // Trigger recalculation after a short delay to ensure form is updated
    setTimeout(() => {
      const total = onCalculateTotal();
      console.log('New total after price change:', total);
    }, 100);
  };

  return (
    <div key={service.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Servicio {serviceIndex + 1}
          {subtotal > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              Subtotal: {subtotal.toFixed(2)} {form.watch('currency')}
            </span>
          )}
        </span>
        {servicesLength > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Removing service', serviceIndex, 'from tier', tierIndex);
              onRemoveService();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <ServiceFormFields
        form={form}
        tierIndex={tierIndex}
        serviceIndex={serviceIndex}
        onQuantityChange={handleQuantityChange}
        onPriceChange={handlePriceChange}
      />

      <FormField
        control={form.control}
        name={`pricingTiers.${tierIndex}.services.${serviceIndex}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción del Servicio</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descripción detallada del servicio..."
                className="min-h-[60px]"
                {...field} 
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
