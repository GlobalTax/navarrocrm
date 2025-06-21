
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { useUsers } from '@/hooks/useUsers'
import { useClients } from '@/hooks/useClients'
import { Case } from '@/hooks/useCases'
import { Building, User, DollarSign, Calendar, FileTemplate, Settings, Bell, Shield } from 'lucide-react'

const matterSchema = z.object({
  title: z.string().min(1, 'Matter title is required'),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'pending', 'closed']),
  client_id: z.string().min(1, 'Client is required'),
  practice_area: z.string().optional(),
  responsible_solicitor_id: z.string().optional(),
  originating_solicitor_id: z.string().optional(),
  billing_method: z.enum(['hourly', 'fixed', 'contingency']).default('hourly'),
  estimated_budget: z.number().optional(),
  template_id: z.string().optional(),
})

type MatterFormData = z.infer<typeof matterSchema>

interface MatterFormDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
  onSubmit: (data: MatterFormData) => void
  isSubmitting: boolean
}

export const MatterFormDialog = ({ case_, open, onClose, onSubmit, isSubmitting }: MatterFormDialogProps) => {
  const [activeTab, setActiveTab] = useState('details')
  const { practiceAreas } = usePracticeAreas()
  const { templates } = useMatterTemplates()
  const { users } = useUsers()
  const { clients } = useClients()

  const form = useForm<MatterFormData>({
    resolver: zodResolver(matterSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'open',
      client_id: '',
      practice_area: '',
      responsible_solicitor_id: '',
      originating_solicitor_id: '',
      billing_method: 'hourly',
      estimated_budget: undefined,
      template_id: '',
    },
  })

  useEffect(() => {
    if (case_) {
      form.reset({
        title: case_.title,
        description: case_.description || '',
        status: case_.status as 'open' | 'in_progress' | 'pending' | 'closed',
        client_id: case_.client_id,
        practice_area: case_.practice_area || '',
        responsible_solicitor_id: case_.responsible_solicitor_id || '',
        originating_solicitor_id: case_.originating_solicitor_id || '',
        billing_method: case_.billing_method as 'hourly' | 'fixed' | 'contingency',
        estimated_budget: case_.estimated_budget || undefined,
        template_id: case_.template_id || '',
      })
    } else {
      form.reset({
        title: '',
        description: '',
        status: 'open',
        client_id: '',
        practice_area: '',
        responsible_solicitor_id: '',
        originating_solicitor_id: '',
        billing_method: 'hourly',
        estimated_budget: undefined,
        template_id: '',
      })
    }
  }, [case_, form])

  const handleSubmit = (data: MatterFormData) => {
    onSubmit(data)
  }

  const statusOptions = [
    { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
    { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-800' },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {case_ ? 'Edit Matter' : 'New Matter'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileTemplate className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="assignment" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assignment
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Matter Information</CardTitle>
                    <CardDescription>
                      Basic information about this matter
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="client_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="template_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No template</SelectItem>
                                {templates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Matter Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Smith vs. Jones litigation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of the matter..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="practice_area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Practice Area</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select practice area" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No practice area</SelectItem>
                                {practiceAreas.map((area) => (
                                  <SelectItem key={area.id} value={area.name}>
                                    {area.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Badge className={option.color}>{option.label}</Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitor Assignment</CardTitle>
                    <CardDescription>
                      Assign responsible and originating solicitors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="responsible_solicitor_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsible Solicitor</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select responsible solicitor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Unassigned</SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originating_solicitor_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Originating Solicitor</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select originating solicitor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Unassigned</SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                      Set billing method and budget information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="billing_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly Rate</SelectItem>
                              <SelectItem value="fixed">Fixed Fee</SelectItem>
                              <SelectItem value="contingency">Contingency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimated_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Budget (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </CardTitle>
                      <CardDescription>
                        Configure matter notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Notification settings will be configured after matter creation.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Permissions
                      </CardTitle>
                      <CardDescription>
                        Configure matter access permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Permission settings will be configured after matter creation.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                * Required fields
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (case_ ? 'Update Matter' : 'Create Matter')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
