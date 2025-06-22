
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ProposalFormData, proposalSchema, PricingTierFormData, ServiceItemFormData } from '../types/proposal.schema';
import { useClients } from '@/hooks/useClients';

interface ProposalBuilderProps {
  onSave: (data: ProposalFormData) => void;
  isSaving: boolean;
}

export const ProposalBuilder: React.FC<ProposalBuilderProps> = ({ onSave, isSaving }) => {
  const { clients } = useClients();
  const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null);

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      clientId: '',
      introduction: '',
      scopeOfWork: '',
      timeline: '',
      pricingTiers: [{
        id: crypto.randomUUID(),
        name: 'Plan Básico',
        description: '',
        services: [{
          id: crypto.randomUUID(),
          name: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          billingCycle: 'once',
          taxable: true
        }],
        totalPrice: 0
      }],
      currency: 'EUR',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    }
  });

  const addPricingTier = () => {
    const currentTiers = form.getValues('pricingTiers');
    form.setValue('pricingTiers', [...currentTiers, {
      id: crypto.randomUUID(),
      name: `Plan ${currentTiers.length + 1}`,
      description: '',
      services: [{
        id: crypto.randomUUID(),
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        billingCycle: 'once' as const,
        taxable: true
      }],
      totalPrice: 0
    }]);
  };

  const removePricingTier = (index: number) => {
    const currentTiers = form.getValues('pricingTiers');
    if (currentTiers.length > 1) {
      form.setValue('pricingTiers', currentTiers.filter((_, i) => i !== index));
    }
  };

  const addService = (tierIndex: number) => {
    const currentTiers = form.getValues('pricingTiers');
    const updatedTiers = [...currentTiers];
    updatedTiers[tierIndex].services.push({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      billingCycle: 'once',
      taxable: true
    });
    form.setValue('pricingTiers', updatedTiers);
  };

  const removeService = (tierIndex: number, serviceIndex: number) => {
    const currentTiers = form.getValues('pricingTiers');
    const updatedTiers = [...currentTiers];
    if (updatedTiers[tierIndex].services.length > 1) {
      updatedTiers[tierIndex].services.splice(serviceIndex, 1);
      form.setValue('pricingTiers', updatedTiers);
    }
  };

  const calculateTierTotal = (tierIndex: number) => {
    const tier = form.watch(`pricingTiers.${tierIndex}`);
    const total = tier.services.reduce((sum, service) => sum + (service.quantity * service.unitPrice), 0);
    form.setValue(`pricingTiers.${tierIndex}.totalPrice`, total);
    return total;
  };

  const onSubmit = (data: ProposalFormData) => {
    // Actualizar totales antes de guardar
    data.pricingTiers.forEach((tier, index) => {
      tier.totalPrice = tier.services.reduce((sum, service) => sum + (service.quantity * service.unitPrice), 0);
    });
    onSave(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Propuesta Comercial</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la Propuesta</FormLabel>
                      <FormControl>
                        <Input placeholder="Propuesta de servicios..." {...field} />
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
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                format(field.value, "PPP", { locale: es })
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

              {/* Secciones de texto */}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Planes de precios */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Planes de Precios</h3>
                  <Button type="button" onClick={addPricingTier} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Plan
                  </Button>
                </div>

                {form.watch('pricingTiers').map((tier, tierIndex) => (
                  <Card key={tier.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Plan {tierIndex + 1}
                        </CardTitle>
                        {form.watch('pricingTiers').length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePricingTier(tierIndex)}
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
                              <FormLabel>Nombre del Plan</FormLabel>
                              <FormControl>
                                <Input placeholder="Plan Básico" {...field} />
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
                                <Input placeholder="Descripción del plan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Servicios del plan */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Servicios</h4>
                          <Button
                            type="button"
                            onClick={() => addService(tierIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Servicio
                          </Button>
                        </div>

                        {tier.services.map((service, serviceIndex) => (
                          <div key={service.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Servicio {serviceIndex + 1}</span>
                              {tier.services.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeService(tierIndex, serviceIndex)}
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
                                          setTimeout(() => calculateTierTotal(tierIndex), 0);
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
                                          setTimeout(() => calculateTierTotal(tierIndex), 0);
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

                      {/* Total del plan */}
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total del Plan:</span>
                          <span className="text-lg font-bold">
                            {calculateTierTotal(tierIndex).toFixed(2)} {form.watch('currency')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Propuesta'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
