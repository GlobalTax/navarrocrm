

## Plan: Tabla inline parametrizable para Contactos

### Problema actual

Las tablas de Personas y Empresas usan `div` con `grid-cols-X` para simular columnas, lo que causa:
- Desalineacion constante entre cabecera y filas
- Columnas hardcodeadas (no parametrizables)
- Imposible reordenar, ocultar o redimensionar columnas
- No usa elementos HTML `<table>` nativos

### Solucion

Crear un componente generico `ParametricTable<T>` que use elementos `<table>` nativos (los primitivos de `src/components/ui/table.tsx` que ya existen) y sea completamente configurable via props. Luego usarlo tanto en Personas como en Empresas.

---

### Cambio 1 -- Crear `src/components/shared/ParametricTable.tsx`

Componente generico que acepta:

```typescript
interface ColumnDef<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  width?: string           // ej: "200px", "25%"
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  visible?: boolean        // para ocultar/mostrar columnas
}

interface ParametricTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  isLoading?: boolean
  emptyMessage?: string
  // Virtualizacion (infinite scroll)
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
  // Ordenacion
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (columnKey: string) => void
}
```

Internamente usa `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` de `ui/table.tsx`. Las filas se renderizan con `InfiniteLoader` + `react-window` pero dentro de un `<table>` real, usando un wrapper que mantiene la estructura semantica.

Para la virtualizacion con tabla HTML nativa, se usara un approach hibrido:
- La cabecera (`thead`) queda fija fuera del scroll
- El `tbody` se renderiza dentro de un contenedor con scroll y altura fija
- Se usa `IntersectionObserver` para cargar mas paginas (en lugar de `react-window`) ya que `FixedSizeList` no es compatible con `<tr>` nativos

### Cambio 2 -- Crear `src/components/contacts/columns/personColumns.tsx`

Definicion de columnas para Personas Fisicas:

| Columna | Render |
|---------|--------|
| Persona | Avatar + nombre |
| Tipo | Icono + label (particular/autonomo) |
| Contacto | Email + telefono |
| Empresa | Icono Building2 + nombre |
| Estado | Badge con color |
| Acciones | Boton editar (hover) |

### Cambio 3 -- Crear `src/components/contacts/columns/companyColumns.tsx`

Definicion de columnas para Empresas:

| Columna | Render |
|---------|--------|
| Empresa | Avatar + nombre + sector |
| Sector | Icono + texto |
| Contacto Principal | Nombre + email + telefono |
| Informacion | Email + telefono empresa |
| Contactos | Contador |
| Estado | Badge |
| Acciones | Boton editar |

### Cambio 4 -- Actualizar `PersonsList.tsx`

Reemplazar `VirtualizedPersonsTable` + `PersonTableHeader` + `PersonRow` por:

```tsx
<ParametricTable
  columns={personColumns}
  data={persons}
  keyExtractor={(p) => p.id}
  onRowClick={(p) => navigate(`/contacts/${p.id}`)}
  hasNextPage={hasNextPage}
  fetchNextPage={fetchNextPage}
  isFetchingNextPage={isFetchingNextPage}
/>
```

### Cambio 5 -- Actualizar `CompaniesList.tsx`

Mismo patron: reemplazar `VirtualizedCompaniesTable` por `ParametricTable` con `companyColumns`.

---

### Beneficios

- **Alineacion perfecta**: `<table>` HTML nativo garantiza que columnas se alinean siempre
- **Parametrizable**: anadir/quitar/reordenar columnas cambiando solo el array de `columns`
- **Reutilizable**: el mismo componente sirve para cualquier entidad (Casos, Facturas, etc.)
- **Ordenacion**: click en cabecera para ordenar (las columnas con `sortable: true`)
- **Visibilidad**: toggle de columnas con la prop `visible`

### Archivos

| Archivo | Accion |
|---------|--------|
| `src/components/shared/ParametricTable.tsx` | Crear -- componente generico |
| `src/components/contacts/columns/personColumns.tsx` | Crear -- config columnas personas |
| `src/components/contacts/columns/companyColumns.tsx` | Crear -- config columnas empresas |
| `src/components/contacts/PersonsList.tsx` | Modificar -- usar ParametricTable |
| `src/components/contacts/CompaniesList.tsx` | Modificar -- usar ParametricTable |

