
## Plan: Corregir error de build por sintaxis de genéricos en JSX

### Problema

La sintaxis `<ParametricTable<Person>` y `<ParametricTable<Company>` en JSX causa conflictos con el sistema de instrumentación de Lovable (que inyecta atributos `data-lov-id` en los tags). El parser no puede distinguir el genérico del cierre del tag.

### Solución

Eliminar el tipo genérico explícito en ambos archivos. TypeScript infiere el tipo automáticamente a partir de las props `columns` y `data`, por lo que no se pierde type-safety.

### Cambios

| Archivo | Línea | Antes | Después |
|---------|-------|-------|---------|
| `PersonsList.tsx` | 109 | `<ParametricTable<Person>` | `<ParametricTable` |
| `CompaniesList.tsx` | 110 | `<ParametricTable<Company>` | `<ParametricTable` |

Son 2 cambios de una sola línea cada uno.
