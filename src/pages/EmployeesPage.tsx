import { EnhancedEmployeesManagement } from '@/components/employees/EnhancedEmployeesManagement'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import React, { useState, Suspense, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function EmployeesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Lazy cargar el organigrama
  const EmployeesOrgChart = React.useMemo(() => {
    const { createOptimizedLazy, RoutePriority } = require('@/utils/routeOptimizer')
    return createOptimizedLazy(
      () => import('@/components/employees/EmployeesOrgChart'),
      RoutePriority.MEDIUM
    )
  }, [])

  return (
    <StandardPageContainer>
      <StandardPageHeader 
        title="Gestión de Empleados"
        description="Administra la información y datos de todos los empleados de la organización"
        primaryAction={{
          label: "Nuevo Empleado",
          onClick: () => setShowCreateDialog(true)
        }}
      />

      {/* Tabs Listado / Organigrama */}
      <div className="mt-2">
        <Tabs defaultValue="listado">
          <TabsList>
            <TabsTrigger value="listado">Listado</TabsTrigger>
            <TabsTrigger value="organigrama">Organigrama</TabsTrigger>
          </TabsList>

          <TabsContent value="listado">
            <EnhancedEmployeesManagement 
              showCreateDialog={showCreateDialog}
              setShowCreateDialog={setShowCreateDialog}
            />
          </TabsContent>

          <TabsContent value="organigrama">
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=>(<div key={i} className="h-40 border rounded-md bg-muted animate-pulse"/>))}</div>}>
              {/* @ts-ignore */}
              <EmployeesOrgChart />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageContainer>
  )
}