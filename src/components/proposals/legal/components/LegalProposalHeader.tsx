import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale } from 'lucide-react';
import { PROPOSAL_STEPS } from '../types/legalProposal.types';
interface LegalProposalHeaderProps {
  currentStep: number;
}
export const LegalProposalHeader: React.FC<LegalProposalHeaderProps> = ({
  currentStep
}) => {
  return <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <CardHeader className="bg-slate-50">
        <div className="flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            
            <div>
              <CardTitle className="text-2xl font-bold">Nueva Propuesta de Servicios Recurrentes</CardTitle>
              
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Paso {currentStep} de {PROPOSAL_STEPS.length}
          </Badge>
        </div>
      </CardHeader>
    </Card>;
};