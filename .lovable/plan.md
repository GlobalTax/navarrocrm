
## Cambiar tipografia a General Sans

### Cambios necesarios

**1. Copiar los archivos de fuente al proyecto**
- Copiar `GeneralSans-Light.otf` y `GeneralSans-Medium.otf` a `public/fonts/`
- Se usa `public/` porque las fuentes se referencian desde CSS con `@font-face`

**2. Actualizar `src/index.css`**
- Eliminar el `@import` de Google Fonts (Manrope)
- Anadir dos declaraciones `@font-face` para General Sans:
  - `GeneralSans-Light` (weight 300)
  - `GeneralSans-Medium` (weight 500)
- Cambiar la referencia en `body` de `'Manrope'` a `'General Sans'`

**3. Actualizar `tailwind.config.ts`**
- Cambiar `fontFamily.sans` de `['Manrope', ...]` a `['General Sans', ...]`

**4. Actualizar `index.html`**
- Eliminar los `<link>` de preconnect y carga de Google Fonts para Manrope

### Nota sobre pesos disponibles
Solo se dispone de Light (300) y Medium (500). El proyecto usa pesos desde 200 a 800. Los textos que usen `font-bold` (700) o `font-semibold` (600) se renderizaran con Medium (500) como fallback del navegador. Si se necesitan mas pesos, habra que subir los archivos adicionales.

### Archivos afectados
| Archivo | Cambio |
|---------|--------|
| `public/fonts/GeneralSans-Light.otf` | Nuevo - copiar fuente |
| `public/fonts/GeneralSans-Medium.otf` | Nuevo - copiar fuente |
| `src/index.css` | Quitar import Manrope, anadir @font-face, cambiar body font |
| `tailwind.config.ts` | Cambiar font-family sans |
| `index.html` | Quitar links Google Fonts |
