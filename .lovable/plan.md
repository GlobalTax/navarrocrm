

## Optimizar rendimiento del sistema de permisos

### Problema
El sistema de permisos no esta mal disenado, pero genera lentitud por:
- Queries sin cache (`staleTime` = 0 por defecto)
- Peticiones secuenciales innecesarias en `useTeams`
- Hooks duplicados que multiplican el overhead
- Multiples queries a la tabla `users` con diferentes queryKeys

### Solucion: 4 optimizaciones concretas

---

**1. Anadir `staleTime` a las queries base (usuarios, equipos, permisos)**

Archivos: `useUsers.ts`, `useTeams.ts`, `useUserPermissions/queries.ts`, `useEnhancedUsers.ts`

Anadir `staleTime: 5 * 60 * 1000` (5 minutos) a todas las queries de datos que cambian poco. Esto evita refetches innecesarios al montar componentes o al cambiar de pestana.

---

**2. Eliminar la query secuencial en `useTeams` memberships**

Archivo: `src/hooks/useTeams.ts`

Actualmente la query de memberships hace:
1. Fetch de `team_memberships`
2. Fetch de `users` por IDs (secuencial)

Cambiar a una sola query con select relacional:
```
.from('team_memberships')
.select('*, user:users(id, email, role)')
```

Si la relacion directa falla por RLS, usar un join via `user_id` con el select embebido de Supabase. Esto elimina 1 round-trip por carga.

---

**3. Unificar queryKey de usuarios**

Archivo: `useEnhancedUsers.ts`

Cuando los filtros estan vacios (search='', role='all', status='all'), usar el mismo queryKey que `useUsers` (`['users', org_id]`) para que React Query comparta la cache. Esto evita tener los mismos 55 usuarios duplicados en memoria con keys distintas.

---

**4. Evitar instanciacion redundante de hooks en `useTimeTrackingMetrics`**

Archivo: `src/hooks/useTimeTrackingMetrics/index.ts`

`useTimeTrackingPermissions` ya llama internamente a `useTeams` y `useUsers`. Pero `useTimeTrackingMetrics` vuelve a llamar a ambos. Refactorizar para que `useTimeTrackingPermissions` exporte tambien los datos de teams/users que ya tiene, y `useTimeTrackingMetrics` los reutilice sin volver a instanciar los hooks.

---

### Impacto esperado
- De ~8-10 queries por carga de pagina a ~4-5
- Eliminacion de refetches al cambiar de pestana/tab
- Eliminacion de 1 round-trip secuencial en memberships
- Menor uso de memoria por cache compartida

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/hooks/useUsers.ts` | Anadir staleTime |
| `src/hooks/useTeams.ts` | staleTime + query unica en memberships |
| `src/hooks/useUserPermissions/queries.ts` | Anadir staleTime |
| `src/hooks/useEnhancedUsers.ts` | Anadir staleTime + unificar queryKey |
| `src/hooks/useTimeTrackingPermissions/index.ts` | Exportar teams/memberships/users |
| `src/hooks/useTimeTrackingMetrics/index.ts` | Reutilizar datos del hook de permisos |
