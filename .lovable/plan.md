
## Tipografia: Medium para titulos, Light para el resto

### Estrategia
En lugar de modificar 458 archivos con clases `font-bold`, `font-semibold`, etc., el cambio se hace en 2 puntos centrales:

### 1. CSS base (`src/index.css`)
- Establecer `font-weight: 300` en `body` para que todo el texto sea Light por defecto
- Anadir regla para `h1, h2, h3, h4, h5, h6` con `font-weight: 500` (Medium)
- Actualizar las clases CRM del design system:
  - `.crm-page-title`, `.crm-section-title`, `.crm-card-title`, `.crm-compact-title` -> `font-weight: 500`
  - `.crm-body-text`, `.crm-button-text`, `.crm-badge-text`, `.crm-table-cell`, etc. -> `font-weight: 300`

### 2. Tailwind config (`tailwind.config.ts`)
- Remapear los pesos para que todas las variantes de Tailwind se reduzcan a los 2 disponibles:

```text
fontWeight:
  light:     300   (sin cambio)
  normal:    300   (era 400 -> ahora Light)
  medium:    500   (sin cambio)
  semibold:  500   (era 600 -> ahora Medium)
  bold:      500   (era 700 -> ahora Medium)
  extrabold: 500   (era 800 -> ahora Medium)
```

Asi, cualquier clase `font-bold` o `font-semibold` existente en los 458 archivos se renderizara automaticamente como Medium (500), y `font-normal` o `font-light` como Light (300). No hay que tocar ningun componente individual.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/index.css` | body font-weight 300, headings font-weight 500, actualizar clases CRM |
| `tailwind.config.ts` | Remapear fontWeight para que todo apunte a 300 o 500 |

### Resultado
- Titulos y encabezados: General Sans Medium (500)
- Todo lo demas (parrafos, badges, botones, tablas): General Sans Light (300)
- Cero cambios en componentes individuales
