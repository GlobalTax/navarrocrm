

## Plan: Corregir alineacion definitiva en tablas de Empresas y Personas

### Problema raiz

El fix anterior (anadir spacer `w-10` en la cabecera) no es suficiente porque:

1. **Avatar con borde extra**: El avatar en las filas tiene `border-2 border-white shadow-lg`, lo que anade 4px al ancho real (44px vs 40px del spacer)
2. **Estructura de nesting diferente**: Las filas tienen un `div` wrapper adicional (`flex items-center gap-3 flex-1 min-w-0`) que la cabecera no replica exactamente
3. **Padding interno inconsistente**: Las filas usan `px-6 py-4` en el `div style={style}` mientras que la cabecera usa `px-6 py-4` en un wrapper diferente

### Solucion

Unificar la estructura exacta de cabecera y filas, eliminando cualquier diferencia de tamanio.

---

### Cambio 1 -- `VirtualizedCompaniesTable.tsx` (cabecera)

Ajustar el spacer de la cabecera para que coincida exactamente con el avatar incluyendo su borde:
- Cambiar `w-10` a `w-10 h-10` con el mismo border invisible (`border-2 border-transparent`) para igualar el box model
- O simplemente usar un ancho fijo con `min-w-[44px]` que coincida con el avatar real

### Cambio 2 -- `CompanyRow` en `VirtualizedCompaniesTable.tsx` (filas)

- Eliminar `border-2 border-white shadow-lg` del Avatar para simplificar y que coincida con `w-10` exacto
- Esto alinea perfectamente con el spacer `w-10` de la cabecera

### Cambio 3 -- `PersonRow.tsx` (filas personas)

- Mismo cambio: eliminar `border-2 border-white shadow-lg` del Avatar
- Asegurar que la estructura `flex > avatar(w-10) + grid-cols-6` coincide con la cabecera

### Cambio 4 -- `PersonTableHeader.tsx` (cabecera personas)

- Verificar que el spacer `w-10` esta correcto (ya fue actualizado en el fix anterior)

---

### Detalle tecnico

**Antes (desalineado):**
```text
Cabecera: [spacer 40px] [gap 12px] [grid-cols-7 ...]
Fila:     [avatar 44px] [gap 12px] [grid-cols-7 ...]
                 ^-- 4px de diferencia por border-2
```

**Despues (alineado):**
```text
Cabecera: [spacer 40px] [gap 12px] [grid-cols-7 ...]
Fila:     [avatar 40px] [gap 12px] [grid-cols-7 ...]
```

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/contacts/VirtualizedCompaniesTable.tsx` | Quitar border-2/shadow del avatar en CompanyRow |
| `src/components/contacts/PersonRow.tsx` | Quitar border-2/shadow del avatar en PersonRow |

Son cambios minimos (2 lineas por archivo) que resuelven la raiz del desajuste.

