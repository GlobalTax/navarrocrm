
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Eye, User, Calendar, Building, DollarSign, FileText } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseTableProps {
  cases: Case[]
  onViewCase: (case_: Case) => void
  onEditCase: (case_: Case) => void
  selectedCases: string[]
  onSelectCase: (caseId: string) => void
  onSelectAll: (selected: boolean) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'open':
      return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
    case 'in_progress':
      return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
    case 'pending':
      return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
    case 'closed':
      return <Badge className="bg-green-100 text-green-800">Closed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getBillingMethodBadge = (method: string) => {
  switch (method) {
    case 'hourly':
      return <Badge variant="secondary">Hourly</Badge>
    case 'fixed':
      return <Badge variant="secondary">Fixed Fee</Badge>
    case 'contingency':
      return <Badge variant="secondary">Contingency</Badge>
    default:
      return <Badge variant="outline">{method}</Badge>
  }
}

export const CaseTable = ({ 
  cases, 
  onViewCase, 
  onEditCase, 
  selectedCases, 
  onSelectCase, 
  onSelectAll 
}: CaseTableProps) => {
  const allSelected = cases.length > 0 && selectedCases.length === cases.length
  const someSelected = selectedCases.length > 0 && selectedCases.length < cases.length

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="min-w-[200px]">Matter</TableHead>
            <TableHead>Matter #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Practice Area</TableHead>
            <TableHead>Responsible Solicitor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Billing Method</TableHead>
            <TableHead>Date Opened</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((case_) => (
            <TableRow 
              key={case_.id} 
              className={`hover:bg-gray-50 ${selectedCases.includes(case_.id) ? 'bg-blue-50' : ''}`}
            >
              <TableCell>
                <Checkbox
                  checked={selectedCases.includes(case_.id)}
                  onCheckedChange={() => onSelectCase(case_.id)}
                />
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{case_.title}</div>
                  {case_.description && (
                    <div className="text-sm text-gray-500 truncate max-w-[300px]">
                      {case_.description}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="font-mono text-sm">
                    {case_.matter_number || 'N/A'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {case_.client?.name || 'Cliente no encontrado'}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {case_.practice_area || 'N/A'}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  {case_.responsible_solicitor?.email || 'Unassigned'}
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(case_.status)}
              </TableCell>

              <TableCell>
                {getBillingMethodBadge(case_.billing_method)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {case_.date_opened ? new Date(case_.date_opened).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {case_.estimated_budget 
                      ? `€${case_.estimated_budget.toLocaleString()}` 
                      : 'N/A'
                    }
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewCase(case_)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditCase(case_)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
