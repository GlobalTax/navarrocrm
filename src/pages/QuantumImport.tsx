import { useEffect, useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { QuantumClientImporter } from '@/components/quantum/QuantumClientImporter'
import { QuantumImportHistory } from '@/components/quantum/QuantumImportHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Database, Users, Building, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
export default function QuantumImport() {
  const [activeTab, setActiveTab] = useState('clients')

  return (
    <StandardPageContainer>
      <StandardPageHeader 
        title="Importación Quantum Economics" 
        description="Importa clientes y empresas desde Quantum Economics a tu sistema de contactos"
        actions={
          <Link to="/contacts">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Contactos
            </Button>
          </Link>
        }
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Historial
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="space-y-4">
          <QuantumClientImporter type="clients" />
        </TabsContent>
        
        <TabsContent value="companies" className="space-y-4">
          <QuantumClientImporter type="companies" />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <QuantumImportHistory />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}