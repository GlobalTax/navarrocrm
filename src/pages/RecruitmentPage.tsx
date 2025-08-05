import { RecruitmentDashboard } from '@/components/recruitment/RecruitmentDashboard'

export default function RecruitmentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reclutamiento y Selección</h1>
        <p className="text-muted-foreground">
          Gestiona candidatos, entrevistas y procesos de contratación
        </p>
      </div>
      
      <RecruitmentDashboard />
    </div>
  )
}