import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Bot, Upload, Settings, Eye, Play, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { HubSpotUploadStep } from './hubspot/HubSpotUploadStep'
import { HubSpotFieldMapping } from './hubspot/HubSpotFieldMapping'
import { HubSpotSettingsStep, MigrationSettings } from './hubspot/HubSpotSettingsStep'
import { HubSpotPreviewStep } from './hubspot/HubSpotPreviewStep'
import { HubSpotMigrationStep } from './hubspot/HubSpotMigrationStep'
import { HubSpotDuplicateHandler } from './hubspot/HubSpotDuplicateHandler'
import { useBulkUploadValidators } from '../bulk-upload/hooks/useBulkUploadValidators'
import { useBulkUploadProcessors } from '../bulk-upload/hooks/useBulkUploadProcessors'
import Papa from 'papaparse'

interface HubSpotMigrationDialogV2Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function HubSpotMigrationDialogV2({ open, onClose, onSuccess }: HubSpotMigrationDialogV2Props) {
  const [activeTab, setActiveTab] = useState('upload')
  const [file, setFile] = useState<File | null>(null)
  const [rawData, setRawData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [validatedData, setValidatedData] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [fieldMappings, setFieldMappings] = useState<any[]>([])
  const [settings, setSettings] = useState<MigrationSettings>({
    batchSize: 25,
    duplicateStrategy: 'skip',
    enableValidation: true,
    mapCompanies: true,
    importDeals: false,
    preserveTimestamps: true,
    defaultStatus: 'activo',
    defaultRelationshipType: 'prospecto'
  })
  
  const [migrationState, setMigrationState] = useState({
    isRunning: false,
    progress: 0,
    currentBatch: 0,
    totalBatches: 0,
    successCount: 0,
    errorCount: 0,
    logs: []
  })

  const { validateHubSpotContact } = useBulkUploadValidators()
  const { processHubSpotContacts } = useBulkUploadProcessors()

  const handleFileSelected = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        const detectedColumns = Object.keys(data[0] || {})
        
        setRawData(data)
        setColumns(detectedColumns)
        
        // Procesar datos
        const validated = []
        const errors = []
        
        data.forEach((row, index) => {
          const { data: validRow, errors: rowErrors } = validateHubSpotContact(row, index)
          if (validRow) validated.push(validRow)
          errors.push(...rowErrors)
        })
        
        setValidatedData(validated)
        setValidationErrors(errors)
        
        if (errors.length === 0) {
          toast.success(`✅ ${validated.length} contactos procesados correctamente`)
          setActiveTab('mapping')
        } else {
          toast.error(`❌ ${errors.length} errores encontrados`)
        }
      }
    })
  }, [validateHubSpotContact])

  const canProceedToNext = (tab: string) => {
    switch (tab) {
      case 'upload': return validatedData.length > 0
      case 'mapping': return fieldMappings.length > 0
      case 'settings': return true
      case 'preview': return validationErrors.length === 0
      default: return false
    }
  }

  const getTabIcon = (tab: string) => {
    const icons = {
      upload: Upload,
      mapping: FileText,
      settings: Settings,
      preview: Eye,
      migration: Play
    }
    return icons[tab as keyof typeof icons] || Upload
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] max-h-[95vh] overflow-hidden border-0.5 border-black rounded-[10px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Migración Avanzada desde HubSpot
            <Badge variant="outline" className="ml-2">v2.0</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            {[
              { id: 'upload', label: 'Cargar' },
              { id: 'mapping', label: 'Mapeo' },
              { id: 'settings', label: 'Config' },
              { id: 'preview', label: 'Vista Previa' },
              { id: 'migration', label: 'Migrar' }
            ].map(tab => {
              const Icon = getTabIcon(tab.id)
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  disabled={!canProceedToNext(tab.id) && tab.id !== 'upload'}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="upload" className="space-y-6">
              <HubSpotUploadStep onFileSelected={handleFileSelected} />
            </TabsContent>

            <TabsContent value="mapping" className="space-y-6">
              <HubSpotFieldMapping 
                detectedColumns={columns}
                onMappingChange={setFieldMappings}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <HubSpotSettingsStep 
                settings={settings}
                onSettingsChange={setSettings}
              />
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <HubSpotPreviewStep 
                validatedData={validatedData}
                validationErrors={validationErrors}
                duplicatesFound={[]}
                estimatedImportTime={Math.ceil(validatedData.length / settings.batchSize) * 2}
              />
            </TabsContent>

            <TabsContent value="migration" className="space-y-6">
              <HubSpotMigrationStep 
                {...migrationState}
                estimatedTimeRemaining={0}
                migrationLogs={migrationState.logs}
              />
            </TabsContent>
          </div>

          <div className="flex justify-between p-6 border-t">
            <Button variant="outline" onClick={onClose} className="border-0.5 border-black rounded-[10px]">
              Cancelar
            </Button>
            <div className="flex gap-3">
              {activeTab !== 'upload' && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const tabs = ['upload', 'mapping', 'settings', 'preview', 'migration']
                    const currentIndex = tabs.indexOf(activeTab)
                    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1])
                  }}
                  className="border-0.5 border-black rounded-[10px]"
                >
                  Anterior
                </Button>
              )}
              {activeTab !== 'migration' && canProceedToNext(activeTab) && (
                <Button 
                  onClick={() => {
                    const tabs = ['upload', 'mapping', 'settings', 'preview', 'migration']
                    const currentIndex = tabs.indexOf(activeTab)
                    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1])
                  }}
                  className="border-0.5 border-black rounded-[10px] hover-lift"
                >
                  Siguiente
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}