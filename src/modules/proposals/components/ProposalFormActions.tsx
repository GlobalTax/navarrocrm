
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProposalFormActionsProps {
  isSaving: boolean;
  clientId?: string;
  onCancel?: () => void;
}

export const ProposalFormActions: React.FC<ProposalFormActionsProps> = ({
  isSaving,
  clientId,
  onCancel
}) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSaving || !clientId}
      >
        {isSaving ? 'Guardando...' : 'Guardar Propuesta'}
      </Button>
    </div>
  );
};
