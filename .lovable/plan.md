

## Plan: Corregir clasificación de contactos y importación Quantum

### Diagnóstico confirmado con datos reales

He consultado la base de datos y encontrado los problemas concretos:

**1. Empresas/entidades mal clasificadas como "particular" (561 registros como particular, varios son empresas)**

Ejemplos reales encontrados en tu BD:
- "APL ABOGADOS Y ADMIN DE FINCAS" (particular)
- "FUNDACIO COL.M.DEU MONTSE" (particular)
- "INDUST.CAFETALES HISPANO" (particular)
- "INST.H.SGDA.FAMILIA URGEL" (particular)
- "LA INTERNACIONAL HOSPEDERA, S." (particular)
- "NH HOTELES ESPAÑA" (particular)
- "ONE TO ONE MARKETING SERVICES," (particular)
- "PATRIMONIAL BILBILITANA 2005," (particular)

Ademas hay registros contables que no son contactos reales:
- "CLIENTES DUDOSO COBRO", "CLIENTES VARIOS..........", "DEUDORES,FACT.PEND.FORMAL.....", "REGISTRO MERCANTIL.......", "NO USAR"

El problema: los `dni_nif` de Quantum son IDs internos cortos (ej. "1675", "644") en vez de CIF/NIF reales, asi que la heuristica de NIF no funciona con estos datos. Ademas faltan patrones de nombre como ABOGADOS, HOTELES, MARKETING, PATRIMONIAL, FUNDACIO, INDUST., etc.

**2. Importacion Quantum: no permite actualizar contactos existentes**

El codigo actual bloquea la seleccion de contactos "duplicados" (ya importados), asi que el usuario no puede actualizar datos. El upsert esta bien configurado pero nunca se ejecuta para contactos existentes porque la UI no deja seleccionarlos.

---

### Cambios propuestos

#### Fase 1: Ampliar heuristica de clasificacion

**Archivo: `src/lib/contactClassification.ts`**
- Añadir keywords de negocio: ABOGADOS, HOTELES, HOSPEDERA, MARKETING, PATRIMONIAL, INMOBILIARIA, CONSTRUCCION, TRANSPORTES, COMERCIAL, DISTRIBUIDORA, INSTALACIONES, ELECTRICAS, SERVICIOS
- Añadir palabras clave de entidades: FUNDACIO (sin tilde), INDUST., INST., CDAD.
- Añadir deteccion de "registros basura": patron de nombre con puntos suspensivos, o keywords NO USAR, CLIENTES VARIOS, DEUDORES, REGISTRO MERCANTIL

**Archivo: `src/components/quantum/QuantumClientImporter.tsx`**
- Reutilizar la funcion centralizada `detectCompanyPattern` del modulo de clasificacion en lugar de duplicar los regex
- Añadir los mismos patrones nuevos

#### Fase 2: Permitir actualizacion de contactos existentes en Quantum import

**Archivo: `src/components/quantum/QuantumClientImporter.tsx`**
- Cambiar la logica de seleccion: permitir seleccionar contactos duplicados (ya importados) con un badge visual "Actualizar"
- El upsert ya esta bien configurado, solo falta dejar pasar los datos

#### Fase 3: Saneamiento de datos existentes

**Migracion SQL (nueva)**
- UPDATE de contactos existentes que matchean los nuevos patrones ampliados
- Reclasificar a `empresa` los de alta confianza
- Marcar como `inactivo` los registros contables/basura

#### Fase 4: Alinear SQL RPC con heuristica ampliada

**Migracion SQL**
- Actualizar `detect_misclassified_contacts` con los nuevos patrones

---

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/lib/contactClassification.ts` | Ampliar con ~15 keywords de negocio + deteccion de registros basura |
| `src/components/quantum/QuantumClientImporter.tsx` | Usar `detectCompanyPattern` centralizado + permitir seleccion de duplicados para update |
| Nueva migracion SQL | Saneamiento masivo + actualizar RPC `detect_misclassified_contacts` |

### Resultado esperado
- Los ~15 registros evidentes de empresa/entidad pasan automaticamente a "empresa"
- Los registros basura (CLIENTES VARIOS, DEUDORES, etc.) se marcan como inactivos
- Quantum import permite reimportar/actualizar contactos existentes
- La logica de clasificacion esta centralizada (un solo lugar)
