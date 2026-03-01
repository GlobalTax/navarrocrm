
## Buscador de clientes en el selector de propuestas

### Problema
Con 953 clientes, el desplegable `Select` actual no tiene campo de busqueda, obligando a hacer scroll manual para encontrar un cliente.

### Solucion
Reemplazar el `Select` por un **Combobox** basado en `Popover` + `Command` (cmdk), que ya esta instalado en el proyecto. Esto anade un campo de texto para filtrar clientes por nombre o email en tiempo real.

### Cambios

**1. Archivo: `src/components/proposals/ClientSelectorWithProspect.tsx`**
- Reemplazar el `Select` + `SelectContent` por un `Popover` + `Command` (cmdk)
- El `CommandInput` permite escribir para filtrar clientes por nombre o email
- Cada `CommandItem` muestra nombre, email y badge de tipo (Empresa/Particular) igual que ahora
- Se mantiene el mismo callback `onClientSelected` y la misma UI de confirmacion verde
- Limitar la lista visible con `CommandList` con max-height para evitar overflow

**2. Imports a cambiar**
- Quitar: `Select, SelectContent, SelectItem, SelectTrigger, SelectValue`
- Anadir: `Popover, PopoverContent, PopoverTrigger` desde `@/components/ui/popover`
- Anadir: `Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList` desde `@/components/ui/command`
- Anadir: `ChevronsUpDown` de lucide-react para el icono del trigger

### Resultado
Un selector con campo de busqueda integrado que filtra los 953 clientes al escribir, mucho mas comodo que hacer scroll.
