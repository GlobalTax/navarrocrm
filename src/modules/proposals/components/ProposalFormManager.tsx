
import { UseFormReturn } from 'react-hook-form';
import { ProposalFormData } from '../types/proposal.schema';

export const useProposalFormManager = (form: UseFormReturn<ProposalFormData>) => {
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
      const tier = form.watch(`pricingTiers.${tierIndex}`);
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
      form.setValue(`pricingTiers.${tierIndex}.totalPrice`, total);
      
      console.log(`Tier ${tierIndex} total calculated:`, total);
      return total;
    } catch (error) {
      console.error('Error calculating tier total:', error);
      return 0;
    }
  };

  return {
    addPricingTier,
    removePricingTier,
    addService,
    removeService,
    calculateTierTotal
  };
};
