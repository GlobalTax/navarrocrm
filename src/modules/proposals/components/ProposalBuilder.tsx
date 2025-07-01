
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ProposalFormData, proposalSchema } from '../types/proposal.schema';
import { PricingTierManager } from './PricingTierManager';
import { ClientSelectorWithProspect } from '@/components/proposals/ClientSelectorWithProspect';

interface ProposalBuilderProps {
  onSave: (data: ProposalFormData) => void;
  isSaving: boolean;
}

export const ProposalBuilder: React.FC<ProposalBuilderProps> = ({ onSave, isSaving }) => {
  console.log('ProposalBuilder rendering, isSaving:', isSaving);

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      clientId: '',
      introduction: '',
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
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    mode: 'onChange'
  });

  // Watch form errors to help with debugging
  const formErrors = form.formState.errors;
  console.log('Form errors:', formErrors);
  console.log('Form values:', form.watch());

  const addPricingTier = () => {
    console.log('Adding new pricing tier');
    try {
      const currentTiers = form.getValues('pricingTiers') || [];
      const newTier = {
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
      };
      
      form.setValue('pricingTiers', [...currentTiers, newTier]);
      console.log('New tier added successfully');
    } catch (error) {
      console.error('Error adding pricing tier:', error);
    }
  };

  const removePricingTier = (index: number) => {
    console.log('Removing pricing tier at index:', index);
    try {
      const currentTiers = form.getValues('pricingTiers') || [];
      if (currentTiers.length > 1 && index >= 0 && index < currentTiers.length) {
        const updatedTiers = currentTiers.filter((_, i) => i !== index);
        form.setValue('pricingTiers', updatedTiers);
        console.log('Tier removed successfully');
      } else {
        console.log('Cannot remove tier - insufficient tiers or invalid index');
      }
    } catch (error) {
      console.error('Error removing pricing tier:', error);
    }
  };

  const addService = (tierIndex: number) => {
    console.log('Adding service to tier:', tierIndex);
    try {
      const currentTiers = form.getValues('pricingTiers') || [];
      if (tierIndex >= 0 && tierIndex < currentTiers.length) {
        const updatedTiers = [...currentTiers];
        const newService = {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          billingCycle: 'once' as const,
          taxable: true
        };
        
        if (!updatedTiers[tierIndex].services) {
          updatedTiers[tierIndex].services = [];
        }
        
        updatedTiers[tierIndex].services.push(newService);
        form.setValue('pricingTiers', updatedTiers);
        console.log('Service added successfully');
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const removeService = (tierIndex: number, serviceIndex: number) => {
    console.log('Removing service from tier:', tierIndex, 'service:', serviceIndex);
    try {
      const currentTiers = form.getValues('pricingTiers') || [];
      if (tierIndex >= 0 && tierIndex < currentTiers.length) {
        const updatedTiers = [...currentTiers];
        const services = updatedTiers[tierIndex].services || [];
        
        if (services.length > 1 && serviceIndex >= 0 && serviceIndex < services.length) {
          updatedTiers[tierIndex].services = services.filter((_, i) => i !== serviceIndex);
          form.setValue('pricingTiers', updatedTiers);
          console.log('Service removed successfully');
        } else {
          console.log('Cannot remove service - insufficient services or invalid index');
        }
      }
    } catch (error) {
      console.error('Error removing service:', error);
    }
  };

  const calculateTierTotal = (tierIndex: number): number => {
    try {
      const tier = (form.watch('pricingTiers') || [])[tierIndex];
      if (!tier || !tier.services) {
        console.log('No tier or services found for index:', tierIndex);
        return 0;
      }
      
      const total = tier.services.reduce((sum, service) => {
        const quantity = service.quantity || 0;
        const unitPrice = service.unitPrice || 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Update the tier's total price
      const currentTiers = form.getValues('pricingTiers') || [];
      if (currentTiers[tierIndex]) {
        const updatedTiers = [...currentTiers];
        updatedTiers[tierIndex].totalPrice = total;
        form.setValue('pricingTiers', updatedTiers);
      }
      
      console.log(`Tier ${tierIndex} total calculated:`, total);
      return total;
    } catch (error) {
      console.error('Error calculating tier total:', error);
      return 0;
    }
  };

  const onSubmit = (data: ProposalFormData) => {
    console.log('Submitting proposal form with data:', data);
    
    try {
      // Ensure all tier totals are updated before saving
      if (data.pricingTiers) {
        data.pricingTiers.forEach((tier, index) => {
          const total = tier.services.reduce((sum, service) => {
            return sum + ((service.quantity || 0) * (service.unitPrice || 0));
          }, 0);
          tier.totalPrice = total;
          console.log(`Final tier ${index} total:`, total);
        });
      }

      console.log('Final proposal data:', data);
      onSave(data);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const watchedTiers = form.watch('pricingTiers') || [];
  const selectedClientId = form.watch('clientId');

  console.log('Current pricing tiers:', watchedTiers.length);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Propuesta Comercial</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Cliente/Prospecto Selector */}
              <ClientSelectorWithProspect
                selectedClientId={selectedClientId}
                onClientSelected={(clientId) => form.setValue('clientId', clientId)}
              />
              
              {/* Información básica de la propuesta */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título de la Propuesta *</label>
                  <input
                    {...form.register('title')}
                    className="w-full p-2 border rounded-md"
                    placeholder="Ej: Servicios Jurídicos Integrales - Plan Mensual"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Introducción</label>
                  <textarea
                    {...form.register('introduction')}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Presentación de la propuesta..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Alcance del Trabajo</label>
                  <textarea
                    {...form.register('scopeOfWork')}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Detalle de los servicios incluidos..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Cronograma</label>
                  <textarea
                    {...form.register('timeline')}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Plazos y fechas importantes..."
                  />
                </div>
              </div>
              
              <PricingTierManager
                form={form}
                pricingTiers={watchedTiers}
                onAddTier={addPricingTier}
                onRemoveTier={removePricingTier}
                onAddService={addService}
                onRemoveService={removeService}
                onCalculateTotal={calculateTierTotal}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving || !form.watch('clientId')}
                >
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
