import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EquipmentInventory } from '@/components/equipment/EquipmentInventory'
import { EquipmentAssignments } from '@/components/equipment/EquipmentAssignments'
import { EquipmentMaintenance } from '@/components/equipment/EquipmentMaintenance'
import { EquipmentStats } from '@/components/equipment/EquipmentStats'

export default function EquipmentPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Equipos</h1>
        <p className="text-muted-foreground">
          Gestiona el inventario de equipos, asignaciones y mantenimiento
        </p>
      </div>

      <EquipmentStats />

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <EquipmentInventory />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <EquipmentAssignments />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <EquipmentMaintenance />
        </TabsContent>
      </Tabs>
    </div>
  )
}