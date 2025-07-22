
import { StandardPageContainer } from "@/components/layout/StandardPageContainer";
import { StandardPageHeader } from "@/components/layout/StandardPageHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { QuantumAccountsManager } from "@/components/quantum/QuantumAccountsManager";

export default function QuantumPage() {
  return (
    <MainLayout>
      <StandardPageContainer>
        <StandardPageHeader
          title="Quantum Economics"
          description="Gestión e integración con la plataforma de contabilidad Quantum Economics"
        />
        <QuantumAccountsManager />
      </StandardPageContainer>
    </MainLayout>
  );
}
