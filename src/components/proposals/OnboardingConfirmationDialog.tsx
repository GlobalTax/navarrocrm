import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserPlus, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  proposalTitle: string
  clientName: string
  clientType: 'particular' | 'empresa'
}

export function OnboardingConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  proposalTitle,
  clientName,
  clientType
}: OnboardingConfirmationDialogProps) {
  const estimatedTime = clientType === 'empresa' ? '15-20' : '10-15'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl">¡Propuesta Aceptada!</DialogTitle>
          <DialogDescription className="text-center">
            La propuesta "{proposalTitle}" ha sido aceptada por {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-0.5 border-blue-200 bg-blue-50 rounded-[10px]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Proceso de Onboarding</h4>
                  <p className="text-sm text-blue-700">
                    Ahora completaremos la información del cliente para activar todos los servicios
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-[10px] border-0.5 border-gray-200">
              <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-900">Tiempo estimado</p>
              <p className="text-xs text-gray-600">{estimatedTime} minutos</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-[10px] border-0.5 border-gray-200">
              <UserPlus className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-900">Tipo de cliente</p>
              <p className="text-xs text-gray-600 capitalize">{clientType}</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>¿Qué sucederá?</strong></p>
            <ul className="text-xs space-y-1 ml-4">
              <li>• Completaremos la información faltante del cliente</li>
              <li>• Configuraremos las preferencias de comunicación</li>
              <li>• Activaremos los servicios contratados</li>
              {clientType === 'empresa' && (
                <li>• Configuraremos la información empresarial</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Posponer
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1"
          >
            Comenzar Onboarding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}