
# SISTEMA DE DISEÑO CAPITTAL
## 🚨 NO MODIFICAR ESTOS ESTILOS 🚨

Este documento define el sistema de diseño CAPITTAL que debe mantenerse consistente en toda la aplicación.

## 📋 Especificaciones

### Sistema de Bordes CAPITTAL
El sistema CAPITTAL utiliza un enfoque estratégico de bordes con **negro** para elementos principales y **grises** para jerarquía visual:

#### Bordes Negros (Principal)
- **Ancho**: 0.5px solid black
- **Uso**: Botones principales, inputs activos, cards importantes, elementos de CTA
- **Clase**: `.border-capittal` o `.capittal-border`
- **Variable CSS**: `--border: 0 0% 0%`

#### Bordes Grises (Secundarios)
- **Gris Claro**: Para separadores y elementos de fondo
  - **Clase**: `.border-capittal-light` o `.capittal-border-light`
  - **Variable CSS**: `--border-light: 0 0% 90%`
  - **Uso**: Separadores, dividers, cards de fondo, elementos sutiles

- **Gris Medio**: Para estados deshabilitados/inactivos
  - **Clase**: `.border-capittal-muted` o `.capittal-border-muted`
  - **Variable CSS**: `--border-muted: 0 0% 75%`
  - **Uso**: Inputs deshabilitados, botones inactivos, elementos no disponibles

- **Gris Oscuro**: Para elementos secundarios
  - **Clase**: `.border-capittal-secondary` o `.capittal-border-secondary`
  - **Variable CSS**: `--border-secondary: 0 0% 60%`
  - **Uso**: Navegación secundaria, botones secundarios, elementos de apoyo

### Reglas de Uso de Bordes

#### ✅ Usar NEGRO cuando:
- Elemento es interactuable y principal (botón primario)
- Input está activo o en foco
- Card contiene información crítica
- Elemento requiere máxima atención visual
- Call-to-action principal

#### ✅ Usar GRIS CLARO cuando:
- Separando secciones visualmente
- Elementos de fondo o contenedores
- Dividers entre elementos de lista
- Cards informativos no críticos
- Sidebar y navegación sutil

#### ✅ Usar GRIS MEDIO cuando:
- Elemento está deshabilitado
- Estado inactivo temporal
- Placeholders o elementos vacíos
- Feedback de "no disponible"

#### ✅ Usar GRIS OSCURO cuando:
- Botones secundarios (no destructivos)
- Navegación secundaria
- Elementos de apoyo importantes pero no principales
- Herramientas y utilidades

### Border-radius
- **Valor**: 10px consistente
- **Clase**: `.rounded-capittal` o `.capittal-radius`
- **Variable CSS**: `--radius: 10px`

### Tipografía
- **Fuente principal**: Manrope (Google Fonts)
- **Pesos disponibles**: 200, 300, 400, 500, 600, 700, 800
- **Clase**: `font-manrope` (por defecto en body)

### Colores
- **Fondo**: Blanco (`bg-white`)
- **Texto**: Negro (`text-black`)
- **Secundario**: Grises (`text-gray-500`, `bg-gray-50`)

### Sombras
- **Base**: `shadow-sm` (equivale a `shadow-capittal`)
- **Hover**: `shadow-lg` (equivale a `shadow-capittal-lg`)

## 🎯 Componentes Estándar

### Cards Principales
```css
.capittal-card {
  @apply bg-white capittal-border capittal-radius shadow-sm;
  transition: all 0.2s ease-out;
}
```

### Cards Secundarias
```css
.capittal-card-secondary {
  @apply bg-white capittal-border-light capittal-radius shadow-sm;
  transition: all 0.2s ease-out;
}
```

### Botones Principales
```css
.capittal-button {
  @apply capittal-border capittal-radius bg-white text-black;
  transition: all 0.2s ease-out;
}
```

### Botones Secundarios
```css
.capittal-button-secondary {
  @apply capittal-border-secondary capittal-radius bg-white text-black;
  transition: all 0.2s ease-out;
}
```

### Inputs
```css
.capittal-input {
  @apply capittal-border capittal-radius bg-white text-black;
  transition: all 0.2s ease-out;
}

.capittal-input:disabled {
  @apply capittal-border-muted bg-gray-50 text-gray-400;
}
```

### Separadores
```css
.capittal-separator {
  @apply capittal-border-light;
}
```

### Badges
```css
.capittal-badge {
  @apply capittal-border capittal-radius bg-white text-black px-2 py-1 text-xs font-medium;
}

.capittal-badge-secondary {
  @apply capittal-border-light capittal-radius bg-gray-50 text-gray-700 px-2 py-1 text-xs font-medium;
}
```

## ✨ Efectos y Animaciones

### Hover Effects
- **Transform**: `translateY(-2px)` para elevación
- **Transición**: `0.2s-0.3s ease-out`
- **Clase**: `.hover-lift`

### Estados Deshabilitados
- **Bordes**: Automáticamente usan `border-muted`
- **Fondo**: `bg-gray-50`
- **Texto**: `text-gray-400`
- **Cursor**: `cursor-not-allowed`

## 🛠️ Clases Utilitarias

### Aplicación Rápida por Tipo
```tsx
// Card principal (negra)
<div className="capittal-card hover-lift">Contenido importante</div>

// Card secundaria (gris claro)
<div className="capittal-card-secondary hover-lift">Información de apoyo</div>

// Botón principal (negro)
<button className="capittal-button hover-lift">Acción Principal</button>

// Botón secundario (gris oscuro)
<button className="capittal-button-secondary hover-lift">Acción Secundaria</button>

// Separador (gris claro)
<hr className="capittal-separator" />

// Badge principal
<span className="capittal-badge">Importante</span>

// Badge secundario
<span className="capittal-badge-secondary">Información</span>
```

### Aplicación Manual con Tailwind
```tsx
// Elementos principales
<div className="border-capittal rounded-capittal shadow-capittal">Principal</div>

// Separadores y elementos sutiles
<div className="border-capittal-light rounded-capittal">Separador</div>

// Estados deshabilitados
<input className="border-capittal-muted rounded-capittal" disabled />

// Elementos secundarios
<button className="border-capittal-secondary rounded-capittal">Secundario</button>
```

## 🚫 Reglas de Uso

### ✅ HACER
- Usar negro para elementos principales e interactivos
- Usar gris claro para separadores y elementos de fondo
- Usar gris medio para estados deshabilitados
- Usar gris oscuro para elementos secundarios importantes
- Mantener consistencia en toda la aplicación
- Aplicar `.hover-lift` a elementos interactivos

### ❌ NO HACER
- Mezclar bordes negros y grises en el mismo contexto sin jerarquía clara
- Usar gris medio para elementos activos
- Usar negro para separadores sutiles
- Cambiar las variables CSS sin actualizar la documentación
- Ignorar los estados deshabilitados

## 📝 Ejemplos de Implementación

### Dashboard Principal
```tsx
// Métricas importantes - negro
<div className="capittal-card hover-lift">
  <h3>Ingresos Mensuales</h3>
  <p>€45,230</p>
</div>

// Información de apoyo - gris claro
<div className="capittal-card-secondary">
  <h4>Notas del mes</h4>
  <p>Información complementaria</p>
</div>
```

### Formularios
```tsx
// Input activo - negro
<input className="capittal-input" type="text" />

// Input deshabilitado - gris medio automático
<input className="capittal-input" type="text" disabled />

// Botón enviar - negro
<button className="capittal-button">Enviar</button>

// Botón cancelar - gris oscuro
<button className="capittal-button-secondary">Cancelar</button>
```

### Navegación
```tsx
// Navegación principal - negro implícito
<nav className="space-y-1">
  <a className="capittal-button">Dashboard</a>
</nav>

// Separador - gris claro
<hr className="capittal-separator my-4" />

// Navegación secundaria - gris oscuro
<nav className="space-y-1">
  <a className="capittal-button-secondary">Configuración</a>
</nav>
```

## 🔧 Mantenimiento

Este sistema está configurado en:
- `src/index.css` - Variables CSS, clases base, y reglas de bordes
- `tailwind.config.ts` - Configuración de Tailwind y utilidades
- `index.html` - Carga de fuentes

**¡El sistema de bordes es fundamental para la jerarquía visual de CAPITTAL!**
