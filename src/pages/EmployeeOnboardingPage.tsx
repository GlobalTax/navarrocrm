import { EmployeeOnboardingManager } from '@/components/users/EmployeeOnboardingManager'

export default function EmployeeOnboardingPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding de Empleados</h1>
        <p className="text-gray-600">Gestiona el proceso de incorporación de nuevos empleados</p>
      </div>
      
      <EmployeeOnboardingManager />
    </div>
  )
}