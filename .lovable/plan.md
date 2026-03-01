
## Plan: Corregir alineacion de columnas en tablas virtualizadas

### Problema
En las tablas de **Empresas** y **Personas Fisicas**, las columnas de datos no se alinean con las cabeceras. Esto ocurre porque:

1. La **cabecera** usa `grid-cols-7` (o `grid-cols-6`) ocupando todo el ancho
2. Las **filas** tienen un Avatar (40px + gap) **fuera** del grid, desplazando todas las columnas hacia la derecha
3. Resultado: los datos aparecen debajo de la cabecera incorrecta (nombre truncado, sectores cortados, etc.)

### Solucion

Igualar la estructura de cabecera y filas para que el avatar forme parte del mismo layout.

---

### Cambio 1 -- `VirtualizedCompaniesTable.tsx` (cabecera empresas)

- Cambiar la cabecera para que tenga un placeholder del mismo ancho que el avatar (40px + gap) antes del grid
- Estructura: `flex` con un `div` de 52px (avatar 40px + gap 12px) + `grid-cols-7`
- Asi la cabecera se alinea exactamente con las filas

### Cambio 2 -- `CompanyRow` en `VirtualizedCompaniesTable.tsx` (filas empresas)

- Asegurar que el grid interior usa las mismas proporciones que la cabecera
- Sin cambio estructural grande, solo garantizar coherencia de anchos

### Cambio 3 -- `PersonTableHeader.tsx` (cabecera personas)

- Mismo ajuste: anadir spacer de 52px antes del `grid-cols-6`

### Cambio 4 -- `PersonRow.tsx` (filas personas)

- Verificar que el grid interior coincide con la cabecera ajustada

---

### Resultado esperado

Las columnas Empresa/Sector/Contacto Principal/Informacion/Contactos/Estado/Acciones quedaran perfectamente alineadas con sus cabeceras, y los nombres dejaran de aparecer truncados innecesariamente.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/contacts/VirtualizedCompaniesTable.tsx` | Ajustar cabecera y filas para alinear con avatar |
| `src/components/contacts/PersonTableHeader.tsx` | Anadir spacer para el avatar |
| `src/components/contacts/PersonRow.tsx` | Verificar coherencia del grid |
