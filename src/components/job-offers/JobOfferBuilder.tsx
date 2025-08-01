import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { JobOfferFormData, JOB_OFFER_STEPS, PositionLevel, WorkSchedule } from '@/types/job-offers'
import { JobOfferStepContent } from './JobOfferStepContent'
import { JobOfferNavigation } from './JobOfferNavigation'
import { JobOfferProgress } from './JobOfferProgress'
import { JobOfferPreview } from './JobOfferPreview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Eye } from 'lucide-react'

interface JobOfferBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: JobOfferFormData) => void
  isSaving?: boolean
}

export function JobOfferBuilder({ 
  open, 
  onOpenChange, 
  onSave, 
  isSaving = false 
}: JobOfferBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<JobOfferFormData>({
    title: '',
    department: '',
    position_level: 'junior' as PositionLevel,
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    salary_amount: 0,
    salary_currency: 'EUR',
    salary_period: 'annual',
    start_date: '',
    probation_period_months: 6,
    vacation_days: 22,
    work_schedule: 'full_time' as WorkSchedule,
    work_location: '',
    remote_work_allowed: false,
    benefits: [],
    requirements: [],
    responsibilities: [],
    additional_notes: '',
    expires_in_days: 7
  })

  const handleStepData = (stepId: string, data: Partial<JobOfferFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < JOB_OFFER_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGoToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleSave = () => {
    onSave(formData)
  }

  const isStepValid = (stepIndex: number): boolean => {
    const step = JOB_OFFER_STEPS[stepIndex]
    if (!step.isRequired) return true

    return step.fields.every(field => {
      const value = formData[field as keyof JobOfferFormData]
      return value !== '' && value !== null && value !== undefined
    })
  }

  const canProceed = isStepValid(currentStep)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            Nueva Oferta de Trabajo
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="form" className="h-full">
              <div className="px-6 py-3 border-b">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Formulario
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="form" className="p-6 space-y-6">
                <JobOfferProgress 
                  steps={JOB_OFFER_STEPS}
                  currentStep={currentStep}
                  onStepClick={handleGoToStep}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {JOB_OFFER_STEPS[currentStep].title}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {JOB_OFFER_STEPS[currentStep].description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <JobOfferStepContent
                      step={JOB_OFFER_STEPS[currentStep]}
                      formData={formData}
                      onUpdate={handleStepData}
                    />
                  </CardContent>
                </Card>

                <JobOfferNavigation
                  currentStep={currentStep}
                  totalSteps={JOB_OFFER_STEPS.length}
                  canProceed={canProceed}
                  isLastStep={currentStep === JOB_OFFER_STEPS.length - 1}
                  isSaving={isSaving}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSave={handleSave}
                />
              </TabsContent>

              <TabsContent value="preview" className="p-6">
                <JobOfferPreview data={formData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}