
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ProposalFormData } from '../types/proposal.schema';

interface ProposalDescriptionFieldsProps {
  form: UseFormReturn<ProposalFormData>;
}

export const ProposalDescriptionFields: React.FC<ProposalDescriptionFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="introduction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Introducción</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Introducción de la propuesta..."
                className="min-h-[100px]"
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
        name="scopeOfWork"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alcance del Trabajo</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descripción detallada del alcance..."
                className="min-h-[120px]"
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
        name="timeline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cronograma</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Cronograma y fechas importantes..."
                className="min-h-[100px]"
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
