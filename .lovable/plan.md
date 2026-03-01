
## Plan: Implementar eliminación de propuestas

### Resumen
Agregar un botón de eliminar (papelera) en las tablas de propuestas, con diálogo de confirmación antes de borrar. Se eliminará la propuesta y sus line items asociados de la base de datos.

### Cambios

**1. Crear función `deleteProposal` en `src/hooks/proposals/useProposalActions.ts`**
- Agregar función que elimine primero los `proposal_line_items` asociados y luego la propuesta
- Registrar la acción en el audit log antes de eliminar
- Invalidar queries de React Query tras el borrado
- Mostrar toast de confirmación

**2. Agregar botón eliminar en `OneTimeProposalActions.tsx`**
- Agregar prop `onDeleteProposal`
- Agregar icono Trash2 con tooltip "Eliminar propuesta"
- Estilo rojo coherente con el sistema de diseño

**3. Agregar botón eliminar en `RecurringProposalActions.tsx`**
- Mismo cambio que en OneTimeProposalActions

**4. Propagar `onDeleteProposal` por la cadena de componentes**
- `ProposalsTabsView.tsx` — agregar prop y pasarla a las 3 tablas (All, OneTime, Recurring)
- `AllProposalsTable.tsx` — agregar prop y pasarla a los Actions
- `OneTimeProposalsTable.tsx` — agregar prop y pasarla
- `RecurringProposalsTable.tsx` — agregar prop y pasarla

**5. Conectar en `Proposals.tsx` (pagina principal)**
- Usar `deleteProposal` del hook `useProposalActions`
- Crear handler `handleDeleteProposal` que abra el diálogo de confirmación existente (`ProposalConfirmationDialog`) antes de ejecutar el borrado
- Pasar `onDeleteProposal` a `ProposalsTabsView`

### Flujo del usuario
1. Click en icono papelera en cualquier propuesta
2. Se abre diálogo: "¿Eliminar propuesta [titulo]? Esta accion no se puede deshacer."
3. Confirmar → se elimina de la BD → toast de exito → tabla se actualiza

### Detalle tecnico
- Se reutiliza el `ProposalConfirmationDialog` que ya existe con variant `destructive`
- Se eliminan primero los `proposal_line_items` (FK) y luego la propuesta
- Se invalidan las queries `['proposals']` y `['proposal-history']`
