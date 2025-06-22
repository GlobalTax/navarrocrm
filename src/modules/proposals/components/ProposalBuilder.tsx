
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ProposalFormData, proposalSchema } from '../types/proposal.schema';
import { ProposalBasicInfo } from './ProposalBasicInfo';
import { PricingTierManager } from './PricingTierManager';

interface ProposalBuilderProps {
  onSave: (data: ProposalFormData) => void;
  isSaving: boolean;
}

export const ProposalBuilder: React.FC<ProposalBuilderProps> = ({ onSave, isSaving }) => {
  console.log('ProposalBuilder rendering');

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
    console.log('Adding pricing tier');
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
    console.log('Submitting proposal data:', data);
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
              <ProposalBasicInfo form={form} />
              
              <PricingTierManager
                form={form}
                pricingTiers={form.watch('pricingTiers')}
                onAddTier={addPricingTier}
                onRemoveTier={removePricingTier}
                onAddService={addService}
                onRemoveService={removeService}
                onCalculateTotal={calculateTierTotal}
              />

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
