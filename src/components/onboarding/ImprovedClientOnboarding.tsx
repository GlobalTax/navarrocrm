import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Users, ArrowRight, TrendingUp } from 'lucide-react'
import { ProspectSelector } from './ProspectSelector'
import { ProspectConversionStep } from './ProspectConversionStep'
import { useProspectConversion } from '@/hooks/useProspectConversion'
import { useContacts } from '@/hooks/useContacts'
import { useOnboarding } from '@/contexts/OnboardingContext'

interface ImprovedClientOnboardingProps {
  onClose?: () => void
}

export const ImprovedClientOnboarding: React.FC<ImprovedClientOnboardingProps> = ({
  onClose
}) => {
  const { contacts } = useContacts()
  const { startOnboarding } = useOnboarding()
  const {
    selectedProspect,
    selectProspect,
    clearSelection,
    convertProspectToClient,
    isConverting,
    getConversionStats
  } = useProspectConversion()

  const [activeTab, setActiveTab] = useState('prospects')
  
  const stats = getConversionStats(contacts)

  const handleProspectSelected = (prospect: any) => {
    selectProspect(prospect)
    setActiveTab('convert')
  }

  const handleConvertToClient = async (updatedData: any) => {
    try {
      await convertProspectToClient.mutateAsync(updatedData)
      // Successful conversion
      onClose?.()
    } catch (error) {
      // Error already handled in the hook
    }
  }

  const handleCreateNewClient = () => {
    // Usar el onboarding tradicional para clientes nuevos
    startOnboarding('general')
    onClose?.()
  }

  const handleBack = () => {
    clearSelection()
    setActiveTab('prospects')
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-r from-primary/5 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-[10px]">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xl">Onboarding Inteligente de Clientes</div>
              <div className="text-sm font-normal text-gray-600">
                Convierte prospectos existentes o crea clientes nuevos
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalProspects}</div>
              <div className="text-xs text-gray-600">Prospectos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalClients}</div>
              <div className="text-xs text-gray-600">Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.recentConversions}</div>
              <div className="text-xs text-gray-600">Esta semana</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
              <div className="text-xs text-gray-600">Tasa conversión</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prospects" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Convertir Prospectos
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Cliente Nuevo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="mt-6">
          {selectedProspect ? (
            <ProspectConversionStep
              selectedProspect={selectedProspect}
              onBack={handleBack}
              onConvert={handleConvertToClient}
              isConverting={isConverting}
            />
          ) : (
            <ProspectSelector
              onProspectSelected={handleProspectSelected}
              onCreateNew={handleCreateNewClient}
            />
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card className="border-dashed border-2 border-primary/30 rounded-[10px]">
            <CardContent className="p-8 text-center">
              <UserPlus className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Crear Cliente desde Cero
              </h3>
              <p className="text-gray-600 mb-6">
                Inicia el proceso de onboarding tradicional para un cliente completamente nuevo
              </p>
              <Button 
                onClick={handleCreateNewClient}
                className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
                size="lg"
              >
                Iniciar Onboarding Completo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}