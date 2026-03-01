

## Plantillas de Propuesta Profesional + Rediseno de Vista Previa

### Contexto
Se han analizado dos modelos reales de propuestas del despacho:
- **Modelo A "Documento Formal"** (Tarragona Sol): Estilo carta legal con logo arriba, secciones numeradas, texto justificado, tabla de honorarios por fases, clausula de confidencialidad y bloque de aceptacion con firma.
- **Modelo B "Presentacion Visual"** (Capital Riesgo): Estilo slide corporativo con portada destacada, titulos grandes en color oscuro (#1a3a2a), esquemas graficos y tabla de honorarios minimalista.

### Parte 1: Guardar los dos modelos como plantillas reutilizables

**Ampliar la tabla `proposal_templates`** anadiendo columnas al campo `template_data` (JSONB) para almacenar la estructura completa de cada modelo:

```text
template_data = {
  style: "formal" | "visual",           // Tipo de diseno
  companyName: string,                    // Nombre del despacho
  companyDescription: string,             // Descripcion corporativa
  defaultIntroduction: string,            // Texto introductorio con placeholders
  sections: [                             // Secciones del documento
    { id, title, type: "text"|"phases"|"team"|"fees"|"terms"|"acceptance", 
      defaultContent: string }
  ],
  phases: [                               // Fases predefinidas
    { name, description, deliverables[], paymentSplit: "70/30" }
  ],
  team: [                                 // Equipo tipo
    { role, name, experience }
  ],
  termsDefaults: {
    validityDays: number,
    confidentiality: boolean,
    expensesClause: string,
    paymentTerms: string
  }
}
```

**Crear dos plantillas seed** insertando en `proposal_templates` los datos extraidos de los PDFs:
- "Propuesta Formal - Proyecto por Fases" (basado en Tarragona Sol)
- "Propuesta Visual - Servicios Corporativos" (basado en Capital Riesgo)

No se necesitan nuevas tablas, solo una migracion SQL con los INSERTs.

### Parte 2: Redisenar la vista previa para que refleje los modelos reales

**2.1 Nuevo componente `ProposalPreviewFormal.tsx`**
Replica el estilo del modelo Tarragona Sol:
- Logo/nombre del despacho arriba a la izquierda
- Titulo "PROPUESTA DE HONORARIOS PROFESIONALES" en negrita
- Lugar y fecha
- Re: nombre del cliente
- Ref: titulo del proyecto en negrita/italica
- Saludo formal "Estimado [nombre]:"
- Parrafo introductorio
- Seccion 1: Informacion General sobre el despacho
- Seccion 2: Alcance - Fases con entregables en bullet points
- Seccion 3: Equipo Responsable con roles en negrita
- Seccion 4: Honorarios - tabla con Fase / Importe / Condiciones de pago
- Seccion 5: Gastos y Suplidos
- Seccion 6: Confidencialidad
- Seccion 7: Duracion y Modificacion
- Bloque de Aceptacion con linea de firma
- Tipografia: serif para cuerpo, sans-serif para titulos, texto justificado

**2.2 Nuevo componente `ProposalPreviewVisual.tsx`**
Replica el estilo del modelo Capital Riesgo:
- Portada: fondo claro con titulo grande en verde oscuro (#1a3a2a), subtitulo, fecha
- Pagina de indice con secciones numeradas
- Paginas de contenido con titulos grandes y texto descriptivo
- Tabla de honorarios minimalista con borde lateral
- Pagina de aceptacion
- Pagina de cierre con "Gracias" y contacto

**2.3 Actualizar `ProfessionalProposalBuilder.tsx`**
- Anadir un selector de "Estilo de propuesta" (Formal / Visual) en la pestana de Informacion Basica
- En la pestana "Vista Previa", renderizar el componente correspondiente segun el estilo seleccionado
- Anadir boton "Cargar desde plantilla" que rellena los campos del formulario con los datos de la plantilla seleccionada

**2.4 Actualizar la edge function `generate-proposal-pdf`**
- Recibir un parametro `style: "formal" | "visual"`
- Generar HTML diferente segun el estilo:
  - Formal: tipografia limpia, secciones numeradas, tabla de honorarios, bloque de firma
  - Visual: portada con fondo, titulos grandes, diseno tipo presentacion
- Mantener la misma logica de datos (propuesta, contacto, line items)

### Parte 3: Integrar selector de plantilla al crear propuesta

**Actualizar `NewProposalDialog.tsx` o el flujo de creacion**
- Antes de abrir el builder, mostrar un paso previo: "Seleccionar plantilla"
- Mostrar las plantillas disponibles como cards con preview miniatura
- Al seleccionar una, pre-rellenar el `ProfessionalProposalBuilder` con los datos de la plantilla

### Archivos a crear
| Archivo | Proposito |
|---------|-----------|
| `src/components/proposals/previews/ProposalPreviewFormal.tsx` | Vista previa estilo documento legal |
| `src/components/proposals/previews/ProposalPreviewVisual.tsx` | Vista previa estilo presentacion corporativa |
| `src/components/proposals/ProposalTemplateSelector.tsx` | Selector de plantilla al crear propuesta |

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/components/proposals/ProfessionalProposalBuilder.tsx` | Selector de estilo + cargar plantilla + render condicional de preview |
| `supabase/functions/generate-proposal-pdf/index.ts` | Dos estilos de HTML segun parametro |
| Migracion SQL | INSERT de las dos plantillas seed |

### Secuencia de implementacion
1. Migracion SQL con las plantillas seed
2. Crear los dos componentes de vista previa (Formal y Visual)
3. Crear el selector de plantillas
4. Integrar todo en el ProfessionalProposalBuilder
5. Actualizar la edge function para generar ambos estilos de HTML/PDF
