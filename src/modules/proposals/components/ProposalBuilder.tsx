
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProposalFormData, proposalSchema } from '../types/proposal.schema';
import { ProposalBasicInfo } from './ProposalBasicInfo';
import { PricingTierManager } from './PricingTierManager';
import { ProposalFormActions } from './ProposalFormActions';
import { useProposalFormManager } from './ProposalFormManager';

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
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    mode: 'onChange'
  });

  // Watch form errors to help with debugging
  const formErrors = form.formState.errors;
  console.log('Form errors:', formErrors);
  console.log('Form values:', form.watch());

  // Use the form manager for tier and service operations
  const {
    addPricingTier,
    removePricingTier,
    addService,
    removeService,
    calculateTierTotal
  } = useProposalFormManager(form);

  const onSubmit = (data: ProposalFormData) => {
    console.log('Submitting proposal form with data:', data);
    
    try {
      // Ensure all tier totals are updated before saving
      data.pricingTiers.forEach((tier, index) => {
        const total = tier.services.reduce((sum, service) => {
          return sum + ((service.quantity || 0) * (service.unitPrice || 0));
        }, 0);
        tier.totalPrice = total;
        console.log(`Final tier ${index} total:`, total);
      });

      console.log('Final proposal data:', data);
      onSave(data);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const watchedTiers = form.watch('pricingTiers') || [];
  const clientId = form.watch('clientId');
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
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="pricing">Precios y Servicios</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <ProposalBasicInfo form={form} />
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                  <PricingTierManager
                    form={form}
                    pricingTiers={watchedTiers}
                    onAddTier={addPricingTier}
                    onRemoveTier={removePricingTier}
                    onAddService={addService}
                    onRemoveService={removeService}
                    onCalculateTotal={calculateTierTotal}
                  />
                </TabsContent>
              </Tabs>

              <ProposalFormActions 
                isSaving={isSaving}
                clientId={clientId}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
