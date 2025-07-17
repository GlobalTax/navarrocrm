import { StandardPageContainer } from "@/components/layout/StandardPageContainer";
import { StandardPageHeader } from "@/components/layout/StandardPageHeader";
import { QuantumInvoicesDashboard } from "@/components/quantum/QuantumInvoicesDashboard";

export default function QuantumBilling() {
  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Análisis de Facturación"
        description="Dashboard de facturación mensual integrado con Quantum Economics"
      />
      <QuantumInvoicesDashboard />
    </StandardPageContainer>
  );
}