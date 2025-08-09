import { StandardPageContainer } from "@/components/layout/StandardPageContainer";
import { StandardPageHeader } from "@/components/layout/StandardPageHeader";
import { QuantumInvoicesDashboard } from "@/components/quantum/QuantumInvoicesDashboard";
import { QuantumInvoiceManualSync } from "@/components/quantum/QuantumInvoiceManualSync";

export default function QuantumBilling() {
  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Análisis de Facturación"
        description="Dashboard de facturación mensual integrado con Quantum Economics"
      />
      <div className="mb-4 flex gap-2 flex-wrap">
        <QuantumInvoiceManualSync 
          label="Sincronizar junio 2025 (mes natural)"
          startDate="2025-06-01"
          endDate="2025-06-30"
        />
        <QuantumInvoiceManualSync />
        <QuantumInvoiceManualSync 
          label="Sincronizar junio + julio 2025"
          startDate="2025-06-01"
          endDate="2025-07-31"
        />
      </div>
      <QuantumInvoicesDashboard />
    </StandardPageContainer>
  );
}