
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
  onCalculateTotal: () => void;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  form,
  tierIndex,
  services,
  onAddService,
  onRemoveService,
  onCalculateTotal
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Servicios</h4>
        <Button
          type="button"
          onClick={onAddService}
          variant="outline"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Servicio
        </Button>
      </div>

      {services.map((service, serviceIndex) => (
        <div key={service.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Servicio {serviceIndex + 1}</span>
            {services.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveService(serviceIndex)}
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
                    <Input placeholder="Consultoría..." {...field} />
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
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        setTimeout(onCalculateTotal, 0);
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
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        setTimeout(onCalculateTotal, 0);
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
};
