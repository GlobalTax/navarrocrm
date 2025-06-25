
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProposalFormData } from '../types/proposal.schema';
import { useClients } from '@/hooks/useClients';
import { ProposalBasicFormFields } from './ProposalBasicFormFields';
import { ProposalCurrencyAndDateFields } from './ProposalCurrencyAndDateFields';
import { ProposalDescriptionFields } from './ProposalDescriptionFields';

interface ProposalBasicInfoProps {
  form: UseFormReturn<ProposalFormData>;
}

export const ProposalBasicInfo: React.FC<ProposalBasicInfoProps> = ({ form }) => {
  console.log('ProposalBasicInfo rendering');
  
  const { clients, isLoading: clientsLoading } = useClients();

  console.log('Clients data:', { clients, clientsLoading });

  return (
    <div className="space-y-6">
      <ProposalBasicFormFields 
        form={form}
        clients={clients || []}
        clientsLoading={clientsLoading}
      />
      
      <ProposalCurrencyAndDateFields form={form} />
      
      <ProposalDescriptionFields form={form} />
    </div>
  );
};
