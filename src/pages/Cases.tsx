
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Search, Filter, RefreshCw, Building, FileTemplate, Download, Trash2 } from 'lucide-react'
import { useCases, Case } from '@/hooks/useCases'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { MatterFormDialog } from '@/components/cases/MatterFormDialog'
import { CaseDetailDialog } from '@/components/cases/CaseDetailDialog'
import { CaseTable } from '@/components/cases/CaseTable'

const Cases = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [selectedCases, setSelectedCases] = useState<string[]>([])

  const {
    filteredCases,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    practiceAreaFilter,
    setPracticeAreaFilter,
    solicitorFilter,
    setSolicitorFilter,
    createCase,
    isCreating
  } = useCases()

  const { practiceAreas } = usePracticeAreas()
  const { users } = useUsers()

  const handleCreateCase = () => {
    setSelectedCase(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsEditDialogOpen(true)
  }

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsDetailDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDetailDialogOpen(false)
    setSelectedCase(null)
  }

  const handleFormSubmit = (data: any) => {
    createCase(data)
    handleDialogClose()
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleSelectCase = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedCases(selected ? filteredCases.map(c => c.id) : [])
  }

  const hasFilters = searchTerm || statusFilter !== 'all' || practiceAreaFilter !== 'all' || solicitorFilter !== 'all'

  const statusCounts = {
    all: filteredCases.length,
    open: filteredCases.filter(c => c.status === 'open').length,
    in_progress: filteredCases.filter(c => c.status === 'in_progress').length,
    pending: filteredCases.filter(c => c.status === 'pending').length,
    closed: filteredCases.filter(c => c.status === 'closed').length,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="h-8 w-8" />
              Matters
            </h1>
            <p className="text-gray-600">Manage all legal matters and cases for your clients</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <FileTemplate className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button onClick={handleCreateCase} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Matter
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs defaultValue="matters" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="matters" className="flex items-center gap-2">
                  Matters
                  <Badge variant="secondary">{statusCounts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="stages">Stages</TabsTrigger>
              </TabsList>

              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              )}
            </div>

            <TabsContent value="matters" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>All Matters</CardTitle>
                    {selectedCases.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {selectedCases.length} selected
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Filters */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search matters by title, description, client, or matter number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                            <SelectItem value="open">Open ({statusCounts.open})</SelectItem>
                            <SelectItem value="in_progress">In Progress ({statusCounts.in_progress})</SelectItem>
                            <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                            <SelectItem value="closed">Closed ({statusCounts.closed})</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Practice Area" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Areas</SelectItem>
                            {practiceAreas.map((area) => (
                              <SelectItem key={area.id} value={area.name}>
                                {area.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={solicitorFilter} onValueChange={setSolicitorFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Solicitor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Solicitors</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {hasFilters && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Filters applied:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setPracticeAreaFilter('all')
                            setSolicitorFilter('all')
                          }}
                        >
                          Clear all
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {error && (
                    <div className="text-center py-8 text-red-600">
                      <p className="font-medium">Error loading matters</p>
                      <p className="text-sm">{error.message}</p>
                      <Button variant="outline" onClick={handleRefresh} className="mt-2">
                        Retry
                      </Button>
                    </div>
                  )}
                  
                  {!error && isLoading && (
                    <div className="flex justify-center py-8">
                      <div className="text-gray-500">Loading matters...</div>
                    </div>
                  )}
                  
                  {!error && !isLoading && filteredCases.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-4">
                        {hasFilters 
                          ? 'No matters found with the applied filters' 
                          : 'No matters registered yet'
                        }
                      </div>
                      {!hasFilters && (
                        <Button onClick={handleCreateCase}>
                          Create first matter
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {!error && !isLoading && filteredCases.length > 0 && (
                    <CaseTable
                      cases={filteredCases}
                      onViewCase={handleViewCase}
                      onEditCase={handleEditCase}
                      selectedCases={selectedCases}
                      onSelectCase={handleSelectCase}
                      onSelectAll={handleSelectAll}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Matter Stages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Matter stages functionality will be implemented here.</p>
                    <p className="text-sm">Track progress through different stages of legal matters.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs */}
        <MatterFormDialog
          case_={selectedCase}
          open={isCreateDialogOpen || isEditDialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleFormSubmit}
          isSubmitting={isCreating}
        />

        <CaseDetailDialog
          case_={selectedCase}
          open={isDetailDialogOpen}
          onClose={handleDialogClose}
          onEdit={handleEditCase}
        />
      </div>
    </MainLayout>
  )
}

export default Cases
