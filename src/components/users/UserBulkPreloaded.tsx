import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  { email: 'a.miro@nrro.es', first_name: 'Aleix', last_name: 'Miró' },
  { email: 'a.brotons@nrro.es', first_name: 'Alejandro', last_name: 'Brotons' },
  { email: 'a.ramirez@nrro.es', first_name: 'Ana', last_name: 'Ramírez' },
  { email: 'a.raso@nrro.es', first_name: 'Anabel', last_name: 'Raso' },
  { email: 'a.martin@nrro.es', first_name: 'Angelo', last_name: 'Martín' },
  { email: 'b.salvo@nrro.es', first_name: 'Blanca', last_name: 'Salvó' },
  { email: 'c.sacco@nrro.es', first_name: 'Carolina', last_name: 'Sacco' },
  { email: 'cp.sanchez@nrro.es', first_name: 'Cinthia Paola', last_name: 'Sánchez' },
  { email: 'c.bellonch@nrro.es', first_name: 'Clara', last_name: 'Bellonch' },
  { email: 'c.gimenez@nrro.es', first_name: 'Clara', last_name: 'Giménez' },
  { email: 'c.martin@nrro.es', first_name: 'Claudia', last_name: 'Martín' },
  { email: 'd.gomez@nrro.es', first_name: 'David', last_name: 'Gómez Rovira' },
  { email: 'e.abellan@nrro.es', first_name: 'Eric', last_name: 'Abellán' },
  { email: 'e.borrell@nrro.es', first_name: 'Estel', last_name: 'Borrell' },
  { email: 'g.zalacain@nrro.es', first_name: 'Gemma', last_name: 'Zalacain' },
  { email: 'g.iriarte@nrro.es', first_name: 'Gerard', last_name: 'Iriarte' },
  { email: 'i.velarde@nrro.es', first_name: 'Irene', last_name: 'Velarde' },
  { email: 'I.Rodriguez@nrro.es', first_name: 'Iván', last_name: 'Rodríguez Ruiz' },
  { email: 'j.salvo@nrro.es', first_name: 'Joan', last_name: 'Salvó' },
  { email: 'j.majoral@nrro.es', first_name: 'Jordi', last_name: 'Majoral' },
  { email: 'j.bonet@nrro.es', first_name: 'Jose', last_name: 'Bonet' },
  { email: 'jm.arguello@nrro.es', first_name: 'José María', last_name: 'Argüello' },
  { email: 'jl.dambrosio@nrro.es', first_name: 'Juan Luis', last_name: 'Dambrosio' },
  { email: 'j.estelle@nrro.es', first_name: 'Júlia', last_name: 'Estellé' },
  { email: 'l.moll@nrro.es', first_name: 'Laia', last_name: 'Moll' },
  { email: 'll.montanya@nrro.es', first_name: 'Lluís', last_name: 'Montanya' },
  { email: 'L.linares@nrro.es', first_name: 'Lucia', last_name: 'Linares' },
  { email: 'm.vidueira@nrro.es', first_name: 'Magdalena', last_name: 'Vidueira' },
  { email: 'm.canet@nrro.es', first_name: 'Marc', last_name: 'Canet' },
  { email: 'm.leon@nrro.es', first_name: 'María', last_name: 'León' },
  { email: 'm.ventin@nrro.es', first_name: 'María', last_name: 'Ventín' },
  { email: 'm.fernandez@nrro.es', first_name: 'Mía', last_name: 'Fernández' },
  { email: 'm.castro@nrro.es', first_name: 'Mónica', last_name: 'Castro' },
  { email: 'n.moreno@nrro.es', first_name: 'Nil', last_name: 'Moreno' },
  { email: 'o.moron@nrro.es', first_name: 'Oriol', last_name: 'Morón' },
  { email: 'p.valls@nrro.es', first_name: 'Pau', last_name: 'Valls' },
  { email: 'p.cardenas@nrro.es', first_name: 'Paula', last_name: 'Cárdenas' },
  { email: 'p.rico@nrro.es', first_name: 'Pepe', last_name: 'Rico' },
  { email: 'p.dambrosio@nrro.es', first_name: 'Pilar', last_name: "D'Ambrosio" },
  { email: 'p.fontclara@nrro.es', first_name: 'Pol', last_name: 'Fontclara' },
  { email: 'q.vall@nrro.es', first_name: 'Queralt', last_name: 'Vall' },
  { email: 'r.chica@nrro.es', first_name: 'Raquel', last_name: 'Chica' },
  { email: 'r.rubio@nrro.es', first_name: 'Raul', last_name: 'Rubio' },
  { email: 'r.serra@nrro.es', first_name: 'Roc', last_name: 'Serra' },
  { email: 'r.rodriguez@nrro.es', first_name: 'Rosa', last_name: 'Rodríguez' },
  { email: 's.alonso@nrro.es', first_name: 'Sara', last_name: 'Alonso' },
  { email: 's.sanz@nrro.es', first_name: 'Sara', last_name: 'Sanz' },
  { email: 'v.lenko@nrro.es', first_name: 'Vasyl', last_name: 'Lenko' },
  { email: 'y.aguilera@nrro.es', first_name: 'Yasmina', last_name: 'Aguilera' },
  { email: 'y.pescador@nrro.es', first_name: 'Yolanda', last_name: 'Pescador' },
  { email: 'y.huang@nrro.es', first_name: 'Yuxiang', last_name: 'Huang' },
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
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border-[0.5px] border-black rounded-[10px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-[Manrope]">
            <Users className="h-5 w-5" />
            Alta equipo NRRO — {PRELOADED_USERS.length} usuarios
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Asigna roles y crea los usuarios del equipo
          </DialogDescription>
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
            <div className="flex-1 min-h-0 max-h-[55vh] overflow-y-auto">
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
                          <SelectContent position="popper" className="z-50">
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
            </div>

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
