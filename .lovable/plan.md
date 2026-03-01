

## Actualizar tipografia: Regular (400) para titulos, Light (300) para el resto

### Cambios

**1. Copiar la fuente Regular al proyecto**
- Copiar `GeneralSans-Regular.otf` a `public/fonts/`

**2. Actualizar `src/index.css`**
- Anadir un nuevo `@font-face` para General Sans peso 400 (Regular) apuntando a `GeneralSans-Regular.otf`
- Cambiar la regla de `h1-h6` de `font-weight: 500` a `font-weight: 400`
- Actualizar las clases CRM de titulo (`.crm-page-title`, `.crm-section-title`, `.crm-card-title`, `.crm-compact-title`, `.crm-responsive-title`, `.crm-table-header`) para usar `font-normal` en vez de `font-medium`

**3. Actualizar `tailwind.config.ts`**
- Remapear los pesos de Tailwind:
  - `normal`: 400 (era 300)
  - `medium`: 400 (era 500)
  - `semibold`: 400 (era 500)
  - `bold`: 400 (era 500)
  - `extrabold`: 400 (era 500)
  - `light`: 300 (sin cambio)

Asi cualquier clase `font-bold`, `font-semibold`, `font-medium` existente se renderiza como Regular (400), y `font-light` o texto sin peso explicito como Light (300).

### Archivos afectados
| Archivo | Cambio |
|---------|--------|
| `public/fonts/GeneralSans-Regular.otf` | Nuevo - copiar fuente |
| `src/index.css` | Anadir @font-face 400, headings a 400, clases CRM a font-normal |
| `tailwind.config.ts` | Remapear pesos a 300 y 400 |

