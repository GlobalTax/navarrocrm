
import { StandardPageContainer } from "@/components/layout/StandardPageContainer";
import { StandardPageHeader } from "@/components/layout/StandardPageHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { QuantumInvoicesDashboard } from "@/components/quantum/QuantumInvoicesDashboard";

export default function QuantumBilling() {
  return (
    <MainLayout>
      <StandardPageContainer>
        <StandardPageHeader
          title="Análisis de Facturación"
          description="Dashboard de facturación mensual integrado con Quantum Economics"
        />
        <QuantumInvoicesDashboard />
      </StandardPageContainer>
    </MainLayout>
  );
}
