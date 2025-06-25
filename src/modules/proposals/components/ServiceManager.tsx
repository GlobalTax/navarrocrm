
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProposalFormData, ServiceItemFormData } from '../types/proposal.schema';
import { ServiceItemCard } from './ServiceItemCard';

interface ServiceManagerProps {
  form: UseFormReturn<ProposalFormData>;
  tierIndex: number;
  services: ServiceItemFormData[];
  onAddService: () => void;
  onRemoveService: (serviceIndex: number) => void;
  onCalculateTotal: () => number;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  form,
  tierIndex,
  services,
  onAddService,
  onRemoveService,
  onCalculateTotal
}) => {
  console.log('ServiceManager rendering for tier:', tierIndex, 'with services:', services.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Servicios</h4>
        <Button
          type="button"
          onClick={() => {
            console.log('Adding new service to tier', tierIndex);
            onAddService();
          }}
          variant="outline"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Servicio
        </Button>
      </div>

      {services.map((service, serviceIndex) => (
        <ServiceItemCard
          key={service.id}
          form={form}
          tierIndex={tierIndex}
          serviceIndex={serviceIndex}
          service={service}
          servicesLength={services.length}
          onRemoveService={() => onRemoveService(serviceIndex)}
          onCalculateTotal={onCalculateTotal}
        />
      ))}
    </div>
  );
};
