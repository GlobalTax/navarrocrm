
# SISTEMA DE DISEÑO CAPITTAL
## 🚨 NO MODIFICAR ESTOS ESTILOS 🚨

Este documento define el sistema de diseño CAPITTAL que debe mantenerse consistente en toda la aplicación.

## 📋 Especificaciones

### Bordes
- **Ancho**: 0.5px solid black
- **Clase**: `.border-capittal` o `.capittal-border`
- **Variable CSS**: `--border: 0 0% 0%` (negro puro)

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
- **Variables CSS**:
  - `--background: 0 0% 100%` (blanco)
  - `--foreground: 0 0% 0%` (negro)

### Sombras
- **Base**: `shadow-sm` (equivale a `shadow-capittal`)
- **Hover**: `shadow-lg` (equivale a `shadow-capittal-lg`)
- **Clases**: `.shadow-capittal`, `.shadow-capittal-lg`

## 🎯 Componentes Estándar

### Cards
```css
.capittal-card {
  @apply bg-white capittal-border capittal-radius shadow-sm;
  transition: all 0.2s ease-out;
}

.capittal-card:hover {
  @apply shadow-lg;
  transform: translateY(-2px);
}
```

### Botones
```css
.capittal-button {
  @apply capittal-border capittal-radius bg-white text-black;
  transition: all 0.2s ease-out;
}

.capittal-button:hover {
  @apply shadow-lg;
  transform: translateY(-2px);
}
```

### Inputs
```css
.capittal-input {
  @apply capittal-border capittal-radius bg-white text-black;
  transition: all 0.2s ease-out;
}

.capittal-input:focus {
  @apply ring-2 ring-black ring-offset-2;
}
```

### Badges
```css
.capittal-badge {
  @apply capittal-border capittal-radius bg-white text-black px-2 py-1 text-xs font-medium;
}
```

## ✨ Efectos y Animaciones

### Hover Effects
- **Transform**: `translateY(-2px)` para elevación
- **Transición**: `0.2s-0.3s ease-out`
- **Clase**: `.hover-lift`

### Animaciones
- **Fade-in**: Para elementos que aparecen (`.animate-fade-in-capittal`)
- **Scale-in**: Para modals (`.animate-scale-in-capittal`)
- **Hover-lift**: Para interacciones (`.hover-lift`)

### Transiciones Estándar
- **Rápida**: `0.2s ease-out` (`.transition-capittal`)
- **Lenta**: `0.3s ease-out` (`.transition-capittal-slow`)

## 🛠️ Clases Utilitarias

### Aplicación Rápida
- `.capittal-card` - Card completa con todos los estilos
- `.capittal-button` - Botón completo con todos los estilos  
- `.capittal-input` - Input completo con todos los estilos
- `.capittal-badge` - Badge completa con todos los estilos

### Elementos Individuales
- `.capittal-border` - Solo el borde
- `.capittal-radius` - Solo el border-radius
- `.border-capittal` - Utilidad de Tailwind para borde
- `.rounded-capittal` - Utilidad de Tailwind para radius

### Efectos
- `.hover-lift` - Efecto de elevación en hover
- `.transition-capittal` - Transición estándar rápida
- `.transition-capittal-slow` - Transición estándar lenta

## 🚫 Reglas de Uso

### ✅ HACER
- Usar las clases predefinidas (`.capittal-*`)
- Mantener consistencia en todos los componentes
- Aplicar `.hover-lift` a elementos interactivos
- Usar transiciones estándar definidas

### ❌ NO HACER
- Modificar los valores base del sistema
- Crear bordes de otros grosores sin justificación
- Usar border-radius diferentes a 10px
- Cambiar las transiciones estándar
- Modificar las variables CSS sin consultar

## 📝 Implementación

### En componentes nuevos:
```tsx
// Card estándar
<div className="capittal-card hover-lift">
  <h3>Título</h3>
  <p>Contenido</p>
</div>

// Botón estándar
<button className="capittal-button hover-lift">
  Acción
</button>

// Input estándar
<input className="capittal-input" />
```

### Con Tailwind:
```tsx
// Aplicación manual
<div className="bg-white border-capittal rounded-capittal shadow-capittal hover-lift">
  Contenido
</div>
```

## 🔧 Mantenimiento

Este sistema está configurado en:
- `src/index.css` - Variables CSS y clases base
- `tailwind.config.ts` - Configuración de Tailwind
- `index.html` - Carga de fuentes

**¡NO MODIFICAR sin revisar este documento!**
