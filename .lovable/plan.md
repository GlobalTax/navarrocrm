
## Reconectar el constructor de propuestas puntuales

### Problema
El `ProposalsBuilderManager` siempre abre el `LegalProposalBuilder` (recurrente) sin importar si el usuario pulsa "Propuesta Especifica" o "Propuesta Recurrente". El `ProfessionalProposalBuilder` existe completo pero no se usa.

### Solucion
Modificar `ProposalsBuilderManager` para que enrute correctamente:
- **Recurrente** (`isRecurrentBuilderOpen`) -> `LegalProposalBuilder` (sin cambios)
- **Puntual** (`isSpecificBuilderOpen`) -> `ProfessionalProposalBuilder`

### Cambios

**Archivo: `src/features/proposals/components/ProposalsBuilderManager.tsx`**

Reemplazar el bloque condicional unico (lineas 28-39) por dos bloques separados:

```
if (isRecurrentBuilderOpen) {
  return (
    <LegalProposalBuilder
      onClose={onCloseRecurrentBuilder}
      onSave={isEditMode && editingProposal && onUpdateProposal 
        ? (data) => onUpdateProposal(editingProposal.id, data)
        : onSaveRecurrentProposal
      }
      isSaving={isSavingRecurrent}
    />
  )
}

if (isSpecificBuilderOpen) {
  return (
    <ProfessionalProposalBuilder
      onBack={onCloseSpecificBuilder}
    />
  )
}
```

El `ProfessionalProposalBuilder` ya tiene su propio sistema de guardado interno via `useProposalProfessional`, asi que solo necesita el callback `onBack` para cerrar.

**Archivo: `src/components/proposals/ProposalsBuilderManager.tsx`** (copia duplicada)
- Aplicar el mismo cambio para mantener ambos archivos sincronizados.

### Resultado
- Boton "Propuesta Recurrente" abre el wizard legal con servicios recurrentes y retainer
- Boton "Propuesta Especifica" abre el constructor profesional con fases, equipo, plantillas y vista previa
