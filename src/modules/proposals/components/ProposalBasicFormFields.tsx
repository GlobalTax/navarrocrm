
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProposalFormData } from '../types/proposal.schema';

interface ProposalBasicFormFieldsProps {
  form: UseFormReturn<ProposalFormData>;
  clients: any[];
  clientsLoading: boolean;
}

export const ProposalBasicFormFields: React.FC<ProposalBasicFormFieldsProps> = ({
  form,
  clients,
  clientsLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título de la Propuesta *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Propuesta de servicios..." 
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
        name="clientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente *</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || ''}
              disabled={clientsLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={clientsLoading ? "Cargando clientes..." : "Seleccionar cliente"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {clients && clients.length > 0 ? (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-clients" disabled>
                    No hay clientes disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
