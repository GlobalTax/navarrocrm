
import React, { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Building2, TrendingUp } from 'lucide-react'
import { DealsPipeline } from '@/components/deals/DealsPipeline'
import { DealsMetrics } from '@/components/deals/DealsMetrics'
import { DealsList } from '@/components/deals/DealsList'

const Deals = () => {
  const [activeTab, setActiveTab] = useState('pipeline')

  const handleNewDeal = () => {
    console.log('Crear nuevo deal')
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="M&A Deals"
        description="Gestión de operaciones de compraventa de empresas"
        action={
          <Button onClick={handleNewDeal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Operación
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Métricas */}
        <DealsMetrics />

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Lista de Deals
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="mt-6">
            <DealsPipeline />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <DealsList />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Analytics M&A en desarrollo
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageContainer>
  )
}

export default Deals
