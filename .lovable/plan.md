
## Plan: Corregir tabla de Empresas (755 vs 5) y reorganizar Sidebar

### Problema 1: Solo salen 5 empresas

La funcion RPC `get_companies_with_contacts` consulta la tabla `public.companies` (que solo tiene 5 registros), en lugar de `public.contacts WHERE client_type = 'empresa'` (que tiene 755 registros). Son tablas distintas y la mayoria de empresas estan en `contacts`.

**Solucion:** Modificar la funcion RPC `get_companies_with_contacts` para que consulte `public.contacts WHERE client_type = 'empresa'` en lugar de `public.companies`. Ademas, adaptar los campos devueltos (la tabla `contacts` tiene `business_sector`, `status`, `email`, `phone`, etc. que `companies` no tiene).

### Problema 2: Sidebar - Separar Contactos en secciones

Actualmente hay un unico enlace "Contactos" en el sidebar (`/contacts`). El usuario quiere:
- Una seccion dedicada con enlaces separados para **Personas Fisicas** y **Empresas**

---

### Cambios planificados

#### 1. Migracion SQL: Reescribir la funcion RPC

Reescribir `get_companies_with_contacts` para que consulte `public.contacts` filtrado por `client_type = 'empresa'`, devolviendo los campos que el frontend necesita (`business_sector`, `status`, `email`, `phone`, `relationship_type`, etc.) y manteniendo la logica de deduplicacion por `quantum_customer_id`.

#### 2. Sidebar: Reorganizar NavigationData.ts

Cambiar la seccion "Principal" del sidebar para separar:

```text
Principal
  - Dashboard
  - Contactos (enlace general /contacts)
    -- o reemplazar por:
  - Personas Fisicas (/contacts?tab=persons)
  - Empresas (/contacts?tab=companies)
  - Casos
  - Escrituras
  - Propuestas
```

Se anadiran los iconos `User` y `Building2` para distinguir visualmente personas y empresas.

#### 3. Ajuste en useInfiniteCompanies.ts

Adaptar el mapeo de datos del hook para que coincida con los nuevos campos devueltos por la RPC actualizada (que ahora vendrán de `contacts` en vez de `companies`).

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | Reescribir funcion `get_companies_with_contacts` |
| `src/components/layout/sidebar/NavigationData.ts` | Separar Contactos en Personas y Empresas |
| `src/hooks/useInfiniteCompanies.ts` | Ajustar mapeo de campos si es necesario |
