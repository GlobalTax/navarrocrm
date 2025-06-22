
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProposalFormData } from '../types/proposal.schema';
import { useClients } from '@/hooks/useClients';

interface ProposalBasicInfoProps {
  form: UseFormReturn<ProposalFormData>;
}

export const ProposalBasicInfo: React.FC<ProposalBasicInfoProps> = ({ form }) => {
  console.log('ProposalBasicInfo rendering');
  
  const { clients, isLoading: clientsLoading } = useClients();

  const formatDate = (date: Date) => {
    try {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleDateString();
    }
  };

  console.log('Clients data:', { clients, clientsLoading });

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moneda</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || 'EUR'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="validUntil"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Válida hasta</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        formatDate(field.value)
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
