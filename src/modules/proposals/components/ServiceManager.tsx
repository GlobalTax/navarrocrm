
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ProposalFormData, ServiceItemFormData } from '../types/proposal.schema';

interface ServiceManagerProps {
  form: UseFormReturn<ProposalFormData>;
  tierIndex: number;
  services: ServiceItemFormData[];
  onAddService: () => void;
  onRemoveService: (serviceIndex: number) => void;
  onCalculateTotal: () => number;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  form,
  tierIndex,
  services,
  onAddService,
  onRemoveService,
  onCalculateTotal
}) => {
  console.log('ServiceManager rendering for tier:', tierIndex, 'with services:', services.length);

  const handleQuantityChange = (serviceIndex: number, value: string) => {
    console.log('Quantity changed for service', serviceIndex, ':', value);
    const numValue = parseInt(value) || 1;
    form.setValue(`pricingTiers.${tierIndex}.services.${serviceIndex}.quantity`, numValue);
    // Trigger recalculation after a short delay to ensure form is updated
    setTimeout(() => {
      const total = onCalculateTotal();
      console.log('New total after quantity change:', total);
    }, 100);
  };

  const handlePriceChange = (serviceIndex: number, value: string) => {
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Servicios</h4>
        <Button
          type="button"
          onClick={() => {
            console.log('Adding new service to tier', tierIndex);
            onAddService();
          }}
          variant="outline"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Servicio
        </Button>
      </div>

      {services.map((service, serviceIndex) => {
        const currentQuantity = form.watch(`pricingTiers.${tierIndex}.services.${serviceIndex}.quantity`) || 1;
        const currentPrice = form.watch(`pricingTiers.${tierIndex}.services.${serviceIndex}.unitPrice`) || 0;
        const subtotal = currentQuantity * currentPrice;

        console.log(`Service ${serviceIndex} - Quantity: ${currentQuantity}, Price: ${currentPrice}, Subtotal: ${subtotal}`);

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
              {services.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('Removing service', serviceIndex, 'from tier', tierIndex);
                    onRemoveService(serviceIndex);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name={`pricingTiers.${tierIndex}.services.${serviceIndex}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Consultoría..." 
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
                name={`pricingTiers.${tierIndex}.services.${serviceIndex}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        step="1"
                        placeholder="1"
                        {...field}
                        value={field.value || 1}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value) || 1);
                          handleQuantityChange(serviceIndex, e.target.value);
                        }}
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
                    <FormLabel>Precio Unit.</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value) || 0);
                          handlePriceChange(serviceIndex, e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`pricingTiers.${tierIndex}.services.${serviceIndex}.billingCycle`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facturación</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || 'once'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="once">Una vez</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="annually">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
      })}
    </div>
  );
};
