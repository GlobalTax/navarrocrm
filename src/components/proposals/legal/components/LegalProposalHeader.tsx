
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scale, X } from 'lucide-react';
import { ProposalStep, PROPOSAL_STEPS } from '@/types/proposals';

interface LegalProposalHeaderProps {
  currentStep: number;
  onClose: () => void;
}

export const LegalProposalHeader: React.FC<LegalProposalHeaderProps> = ({
  currentStep,
  onClose
}) => {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <CardHeader className="bg-slate-50">
        <div className="flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Nueva Propuesta de Servicios Recurrentes</CardTitle>
              <p className="text-gray-600 mt-1">Servicios jurídicos con facturación mensual</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Paso {currentStep} de {PROPOSAL_STEPS.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
