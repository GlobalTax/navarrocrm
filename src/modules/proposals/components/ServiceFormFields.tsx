
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProposalFormData } from '../types/proposal.schema';

interface ServiceFormFieldsProps {
  form: UseFormReturn<ProposalFormData>;
  tierIndex: number;
  serviceIndex: number;
  onQuantityChange: (value: string) => void;
  onPriceChange: (value: string) => void;
}

export const ServiceFormFields: React.FC<ServiceFormFieldsProps> = ({
  form,
  tierIndex,
  serviceIndex,
  onQuantityChange,
  onPriceChange
}) => {
  return (
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
                  onQuantityChange(e.target.value);
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
                  onPriceChange(e.target.value);
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
  );
};
