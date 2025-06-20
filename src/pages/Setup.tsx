
import { useState } from 'react'
import { SetupLayout } from '@/components/setup/SetupLayout'
import { OrganizationSetupForm } from '@/components/setup/OrganizationSetupForm'
import { UserSetupForm } from '@/components/setup/UserSetupForm'

export default function Setup() {
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState('')

  const handleOrgSuccess = (name: string) => {
    setOrgName(name)
    setStep(2)
  }

  const handleBackToStep1 = () => {
    setStep(1)
  }

  if (step === 1) {
    return (
      <SetupLayout 
        title="Configuración Inicial" 
        description="Configura tu organización"
      >
        <OrganizationSetupForm onSuccess={handleOrgSuccess} />
      </SetupLayout>
    )
  }

  return (
    <SetupLayout 
      title="Configuración Inicial" 
      description="Crea el usuario administrador"
    >
      <UserSetupForm orgName={orgName} onBack={handleBackToStep1} />
    </SetupLayout>
  )
}
