
## Plan: Crear tareas a partir de imagenes (emails, capturas, etc.)

### Objetivo
Permitir al usuario subir una imagen (captura de un email, documento, etc.) y que la IA extraiga automaticamente los datos relevantes para pre-rellenar el formulario de creacion de tareas (titulo, descripcion, prioridad, fecha limite).

---

### Paso 1 -- Configurar secreto de OpenAI

Se necesita una API key de OpenAI para usar el modelo de vision (GPT-4o). Se solicitara al usuario que proporcione su clave.

---

### Paso 2 -- Crear Edge Function `extract-task-from-image`

**Nuevo archivo: `supabase/functions/extract-task-from-image/index.ts`**

Recibe una imagen en base64 y la envia a la API de OpenAI (GPT-4o con vision) con un prompt que le pide extraer:
- `title`: Titulo conciso de la tarea
- `description`: Descripcion detallada
- `priority`: low / medium / high / urgent
- `due_date`: Fecha limite si se detecta (formato ISO)
- `estimated_hours`: Horas estimadas si es posible inferir

El prompt estara orientado a emails y documentos en castellano. Devuelve JSON estructurado.

---

### Paso 3 -- Anadir boton "Crear desde imagen" al formulario de tareas

**Archivo modificado: `src/components/tasks/TaskFormDialog.tsx`**

- Anadir un boton con icono de camara/imagen en la cabecera del dialogo
- Al pulsar, abre un area de drop/upload (usando `react-dropzone`, ya instalado)
- Al subir la imagen, llama a la edge function
- Con la respuesta, pre-rellena los campos del formulario (`title`, `description`, `priority`, `due_date`)
- Muestra un indicador de carga mientras se procesa

---

### Paso 4 -- Crear componente de extraccion de imagen

**Nuevo archivo: `src/components/tasks/TaskImageExtractor.tsx`**

Componente reutilizable que:
- Muestra zona de drag & drop para imagenes (JPG, PNG, WEBP)
- Convierte la imagen a base64
- Llama a `supabase.functions.invoke('extract-task-from-image', { body: { image: base64 } })`
- Devuelve los datos extraidos al componente padre via callback `onExtracted(data)`
- Muestra estado de carga con skeleton/spinner
- Muestra preview de la imagen subida

---

### Flujo del usuario

```text
1. Usuario abre "Nueva Tarea"
2. Pulsa boton "Extraer de imagen" (icono de imagen)
3. Arrastra o selecciona una captura de pantalla (ej. email)
4. Se muestra spinner "Analizando imagen..."
5. La IA extrae los datos y pre-rellena el formulario
6. El usuario revisa, ajusta si es necesario, y pulsa "Crear Tarea"
```

---

### Archivos afectados

| Archivo | Accion |
|---------|--------|
| `supabase/functions/extract-task-from-image/index.ts` | Nuevo - Edge function con OpenAI Vision |
| `src/components/tasks/TaskImageExtractor.tsx` | Nuevo - Componente de upload + extraccion |
| `src/components/tasks/TaskFormDialog.tsx` | Modificar - integrar boton y extractor |
| `src/hooks/useTaskForm.ts` | Modificar - exponer `setFormData` o metodo para pre-rellenar |
| Secreto `OPENAI_API_KEY` | Nuevo - se solicitara al usuario |

### Notas tecnicas

- Se usa GPT-4o (modelo con vision) para analizar la imagen
- La imagen se envia como base64 en el body de la request
- Limite de tamano: se valida < 5MB en el cliente
- No se almacena la imagen en storage, solo se usa para el analisis
- El componente sigue el sistema de diseno: bordes 0.5px, rounded-[10px], Manrope
