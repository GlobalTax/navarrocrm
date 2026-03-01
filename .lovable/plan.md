
## Restringir "Cuotas Recurrentes" en el sidebar solo a superadmin/partner

### Problema
Actualmente todos los usuarios ven "Cuotas Recurrentes" en el sidebar. Solo el superadmin (partner) deberia verlo, ya que los usuarios normales solo registran horas.

### Solucion

**1. Ampliar el tipo `NavigationItem` con roles permitidos** (`NavigationData.ts`)
- Anadir campo opcional `allowedRoles?: string[]` al tipo `NavigationItem`.
- Configurar `allowedRoles: ['partner']` en el item "Cuotas Recurrentes".
- Tambien aplicar restriccion similar a otros items sensibles como "Admin Academia", "Admin IA", "Usuarios del Sistema", "Integraciones" y "Reportes" si procede.

**2. Filtrar items por rol en `NavigationMenu.tsx`**
- Importar `useApp` para obtener el rol del usuario actual.
- Antes de renderizar cada item, comprobar si tiene `allowedRoles` y si el rol del usuario esta incluido. Si no tiene `allowedRoles`, se muestra a todos.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/layout/sidebar/NavigationData.ts` | Anadir `allowedRoles` al tipo y al item de Cuotas Recurrentes |
| `src/components/layout/sidebar/NavigationMenu.tsx` | Filtrar items segun rol del usuario |

### Detalle tecnico

```text
NavigationItem {
  title, url, icon, badge?,
  allowedRoles?  <-- NUEVO (si undefined, visible para todos)
}

NavigationMenu:
  const { user } = useApp()
  items.filter(item => 
    !item.allowedRoles || item.allowedRoles.includes(user?.role)
  )
```
