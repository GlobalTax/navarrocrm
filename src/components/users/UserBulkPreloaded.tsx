import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download, Users, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

type Role = 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance'

interface PreloadedUser {
  email: string
  first_name: string
  last_name: string
  role: Role | ''
  selected: boolean
}

interface CreatedCredential {
  email: string
  password: string
  success: boolean
  error?: string
}

const ROLE_LABELS: Record<Role, string> = {
  partner: 'Partner',
  area_manager: 'Area Manager',
  senior: 'Senior',
  junior: 'Junior',
  finance: 'Finance',
}

const PRELOADED_USERS: Omit<PreloadedUser, 'role' | 'selected'>[] = [
  { email: 'a.montero@nrro.es', first_name: 'Adrián', last_name: 'Montero' },
  { email: 'a.munoz@nrro.es', first_name: 'Adrián', last_name: 'Muñoz' },
  { email: 'a.virto@nrro.es', first_name: 'Alba', last_name: 'Virto' },
  { email: 'a.vicente@nrro.es', first_name: 'Alberto', last_name: 'Vicente' },
  { email: 'a.lopez@nrro.es', first_name: 'Alfonso', last_name: 'López' },
  { email: 'a.navarro@nrro.es', first_name: 'Alicia', last_name: 'Navarro' },
  { email: 'a.nunez@nrro.es', first_name: 'Álvaro', last_name: 'Núñez' },
  { email: 'a.moreno@nrro.es', first_name: 'Ana', last_name: 'Moreno' },
  { email: 'a.blanco@nrro.es', first_name: 'Andrea', last_name: 'Blanco' },
  { email: 'a.ruiz@nrro.es', first_name: 'Ángela', last_name: 'Ruiz' },
  { email: 'b.martinez@nrro.es', first_name: 'Beatriz', last_name: 'Martínez' },
  { email: 'c.garcia@nrro.es', first_name: 'Carlos', last_name: 'García' },
  { email: 'c.fernandez@nrro.es', first_name: 'Carmen', last_name: 'Fernández' },
  { email: 'c.lopez@nrro.es', first_name: 'Cristina', last_name: 'López' },
  { email: 'd.sanchez@nrro.es', first_name: 'Daniel', last_name: 'Sánchez' },
  { email: 'd.martin@nrro.es', first_name: 'David', last_name: 'Martín' },
  { email: 'e.rodriguez@nrro.es', first_name: 'Elena', last_name: 'Rodríguez' },
  { email: 'e.perez@nrro.es', first_name: 'Enrique', last_name: 'Pérez' },
  { email: 'f.gomez@nrro.es', first_name: 'Fernando', last_name: 'Gómez' },
  { email: 'f.jimenez@nrro.es', first_name: 'Francisco', last_name: 'Jiménez' },
  { email: 'g.diaz@nrro.es', first_name: 'Gloria', last_name: 'Díaz' },
  { email: 'g.hernandez@nrro.es', first_name: 'Gonzalo', last_name: 'Hernández' },
  { email: 'h.romero@nrro.es', first_name: 'Hugo', last_name: 'Romero' },
  { email: 'i.torres@nrro.es', first_name: 'Irene', last_name: 'Torres' },
  { email: 'j.vazquez@nrro.es', first_name: 'Javier', last_name: 'Vázquez' },
  { email: 'j.ramos@nrro.es', first_name: 'Jorge', last_name: 'Ramos' },
  { email: 'j.serrano@nrro.es', first_name: 'José', last_name: 'Serrano' },
  { email: 'j.molina@nrro.es', first_name: 'Juan', last_name: 'Molina' },
  { email: 'l.castro@nrro.es', first_name: 'Laura', last_name: 'Castro' },
  { email: 'l.ortiz@nrro.es', first_name: 'Lucía', last_name: 'Ortiz' },
  { email: 'l.rubio@nrro.es', first_name: 'Luis', last_name: 'Rubio' },
  { email: 'm.delgado@nrro.es', first_name: 'Manuel', last_name: 'Delgado' },
  { email: 'm.suarez@nrro.es', first_name: 'María', last_name: 'Suárez' },
  { email: 'm.medina@nrro.es', first_name: 'Marta', last_name: 'Medina' },
  { email: 'm.iglesias@nrro.es', first_name: 'Miguel', last_name: 'Iglesias' },
  { email: 'n.alonso@nrro.es', first_name: 'Natalia', last_name: 'Alonso' },
  { email: 'o.gutierrez@nrro.es', first_name: 'Óscar', last_name: 'Gutiérrez' },
  { email: 'p.dominguez@nrro.es', first_name: 'Pablo', last_name: 'Domínguez' },
  { email: 'p.alvarez@nrro.es', first_name: 'Patricia', last_name: 'Álvarez' },
  { email: 'r.guerrero@nrro.es', first_name: 'Rafael', last_name: 'Guerrero' },
  { email: 'r.santos@nrro.es', first_name: 'Raquel', last_name: 'Santos' },
  { email: 'r.navarro@nrro.es', first_name: 'Roberto', last_name: 'Navarro' },
  { email: 'r.cruz@nrro.es', first_name: 'Rosa', last_name: 'Cruz' },
  { email: 's.prieto@nrro.es', first_name: 'Sandra', last_name: 'Prieto' },
  { email: 's.vargas@nrro.es', first_name: 'Santiago', last_name: 'Vargas' },
  { email: 's.reyes@nrro.es', first_name: 'Sara', last_name: 'Reyes' },
  { email: 's.cano@nrro.es', first_name: 'Sergio', last_name: 'Cano' },
  { email: 's.pascual@nrro.es', first_name: 'Silvia', last_name: 'Pascual' },
  { email: 't.herrera@nrro.es', first_name: 'Teresa', last_name: 'Herrera' },
  { email: 'v.leon@nrro.es', first_name: 'Víctor', last_name: 'León' },
  { email: 'v.mora@nrro.es', first_name: 'Virginia', last_name: 'Mora' },
  { email: 'x.cortes@nrro.es', first_name: 'Xavier', last_name: 'Cortés' },
  { email: 'y.gallego@nrro.es', first_name: 'Yolanda', last_name: 'Gallego' },
]

interface UserBulkPreloadedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UserBulkPreloaded = ({ open, onOpenChange }: UserBulkPreloadedProps) => {
  const { user } = useApp()
  const [users, setUsers] = useState<PreloadedUser[]>(
    PRELOADED_USERS.map(u => ({ ...u, role: '' as const, selected: true }))
  )
  const [isCreating, setIsCreating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [credentials, setCredentials] = useState<CreatedCredential[]>([])
  const [phase, setPhase] = useState<'assign' | 'creating' | 'done'>('assign')

  const selectedWithRole = useMemo(
    () => users.filter(u => u.selected && u.role !== ''),
    [users]
  )

  const selectedCount = users.filter(u => u.selected).length
  const withoutRole = users.filter(u => u.selected && u.role === '').length

  const toggleAll = (checked: boolean) => {
    setUsers(prev => prev.map(u => ({ ...u, selected: checked })))
  }

  const toggleUser = (index: number) => {
    setUsers(prev => prev.map((u, i) => i === index ? { ...u, selected: !u.selected } : u))
  }

  const setRole = (index: number, role: Role | '') => {
    setUsers(prev => prev.map((u, i) => i === index ? { ...u, role } : u))
  }

  const quickAssign = (role: Role) => {
    setUsers(prev => prev.map(u => u.selected ? { ...u, role } : u))
  }

  const handleCreate = async () => {
    if (selectedWithRole.length === 0) {
      toast.error('No hay usuarios con rol asignado para crear')
      return
    }

    setPhase('creating')
    setIsCreating(true)
    setCredentials([])
    setProgress(0)

    const orgId = user?.org_id
    if (!orgId) {
      toast.error('No se pudo determinar la organización')
      return
    }

    const results: CreatedCredential[] = []

    for (let i = 0; i < selectedWithRole.length; i++) {
      const u = selectedWithRole[i]
      setCurrentIndex(i + 1)
      setProgress(((i + 1) / selectedWithRole.length) * 100)

      try {
        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email: u.email,
            role: u.role,
            firstName: u.first_name,
            lastName: u.last_name,
            orgId,
          },
        })

        if (error) throw error

        results.push({ email: u.email, password: data.password, success: true })
      } catch (err: any) {
        results.push({
          email: u.email,
          password: '',
          success: false,
          error: err?.message || 'Error desconocido',
        })
      }

      // Rate-limit delay
      if (i < selectedWithRole.length - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    setCredentials(results)
    setIsCreating(false)
    setPhase('done')

    const successCount = results.filter(r => r.success).length
    toast.success(`${successCount} de ${results.length} usuarios creados correctamente`)
  }

  const downloadCSV = () => {
    const successful = credentials.filter(c => c.success)
    if (successful.length === 0) return

    const csv = ['email,contraseña_temporal']
      .concat(successful.map(c => `${c.email},${c.password}`))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `credenciales_nrro_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    if (isCreating) return
    onOpenChange(false)
    // Reset state after close
    setTimeout(() => {
      setPhase('assign')
      setProgress(0)
      setCredentials([])
      setUsers(PRELOADED_USERS.map(u => ({ ...u, role: '' as const, selected: true })))
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col border-[0.5px] border-black rounded-[10px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-[Manrope]">
            <Users className="h-5 w-5" />
            Alta equipo NRRO — {PRELOADED_USERS.length} usuarios
          </DialogTitle>
        </DialogHeader>

        {phase === 'assign' && (
          <>
            {/* Quick assign buttons */}
            <div className="flex flex-wrap gap-2 pb-2 border-b">
              <span className="text-sm text-muted-foreground self-center mr-2">Asignar rápido:</span>
              {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([role, label]) => (
                <Button
                  key={role}
                  size="sm"
                  variant="outline"
                  className="border-[0.5px] border-black rounded-[10px] text-xs"
                  onClick={() => quickAssign(role)}
                >
                  Todos {label}
                </Button>
              ))}
            </div>

            {/* Table */}
            <ScrollArea className="flex-1 min-h-0 max-h-[55vh]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="border-b text-left">
                    <th className="p-2 w-8">
                      <Checkbox
                        checked={selectedCount === users.length}
                        onCheckedChange={(c) => toggleAll(!!c)}
                      />
                    </th>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Email</th>
                    <th className="p-2 w-44">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.email} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Checkbox checked={u.selected} onCheckedChange={() => toggleUser(i)} />
                      </td>
                      <td className="p-2">{u.first_name} {u.last_name}</td>
                      <td className="p-2 text-muted-foreground">{u.email}</td>
                      <td className="p-2">
                        <Select value={u.role} onValueChange={(v) => setRole(i, v as Role)}>
                          <SelectTrigger className="h-8 border-[0.5px] border-black rounded-[10px] text-xs">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([role, label]) => (
                              <SelectItem key={role} value={role}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedWithRole.length} listos para crear
                {withoutRole > 0 && (
                  <span className="text-warning ml-2">
                    <AlertCircle className="inline h-3.5 w-3.5 mr-1" />
                    {withoutRole} sin rol
                  </span>
                )}
              </div>
              <Button
                onClick={handleCreate}
                disabled={selectedWithRole.length === 0}
                className="border-[0.5px] border-black rounded-[10px]"
              >
                <Play className="h-4 w-4 mr-2" />
                Crear {selectedWithRole.length} usuarios
              </Button>
            </div>
          </>
        )}

        {phase === 'creating' && (
          <div className="py-12 space-y-6 text-center">
            <p className="text-lg font-medium">
              Creando usuarios... {currentIndex} de {selectedWithRole.length}
            </p>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">No cierres esta ventana</p>
          </div>
        )}

        {phase === 'done' && (
          <div className="space-y-4">
            <div className="flex gap-4 justify-center py-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                {credentials.filter(c => c.success).length} creados
              </div>
              {credentials.filter(c => !c.success).length > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  {credentials.filter(c => !c.success).length} errores
                </div>
              )}
            </div>

            {/* Error details */}
            {credentials.filter(c => !c.success).length > 0 && (
              <ScrollArea className="max-h-40 border rounded-[10px] p-3">
                {credentials.filter(c => !c.success).map(c => (
                  <div key={c.email} className="text-sm text-destructive py-1">
                    {c.email}: {c.error}
                  </div>
                ))}
              </ScrollArea>
            )}

            <div className="flex justify-center gap-3 pt-4">
              <Button
                onClick={downloadCSV}
                className="border-[0.5px] border-black rounded-[10px]"
                disabled={credentials.filter(c => c.success).length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar credenciales CSV
              </Button>
              <Button variant="outline" onClick={handleClose} className="border-[0.5px] border-black rounded-[10px]">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
