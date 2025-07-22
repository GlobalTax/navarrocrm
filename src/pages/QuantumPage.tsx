import { StandardPageContainer } from "@/components/layout/StandardPageContainer";
import { StandardPageHeader } from "@/components/layout/StandardPageHeader";
import { QuantumAccountsManager } from "@/components/quantum/QuantumAccountsManager";

export default function QuantumPage() {
  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Quantum Economics"
        description="Gestión e integración con la plataforma de contabilidad Quantum Economics"
      />
      <QuantumAccountsManager />
    </StandardPageContainer>
  );
}