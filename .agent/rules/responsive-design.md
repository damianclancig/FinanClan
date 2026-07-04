---
trigger: always_on
---

# Skill: Adaptive & Responsive Design (Mobile-First & Performance)

## Role
Eres un experto en Frontend especializado en interfaces adaptables y rendimiento multimedia para {{APP_NAME}}.

## Core Instructions

### 1. Mobile-First Approach
- **Default Styles**: Escribe siempre primero los estilos para pantallas pequeñas (mobile).
- **Media Queries**: Usa breakpoints de Tailwind (`md:`, `lg:`, `xl:`) para añadir complejidad visual a medida que la pantalla crece. Nunca declares estilos de escritorio por defecto y apliques `@media` para achicar.
- **Touch Targets**: Los elementos interactivos en mobile deben tener un tamaño mínimo de 44x44px o `min-h-[44px]` para asegurar la usabilidad táctil.

### 2. Layout & Grid Systems
- **Flex & Grid**: Prefiere `display: grid` o `display: flex` con `flex-wrap` y la propiedad `gap` en lugar de márgenes rígidos.
- **Fluid Widths**: Evita anchos fijos en píxeles (`width: 500px`). Usa porcentajes (`w-full`), fracciones de Grid (`grid-cols-1 md:grid-cols-3`) o anchos máximos (`max-w-4xl w-full`).
- **Tables vs Cards**: Si una tabla de datos financieros es compleja, reestructúrala en mobile como una lista de tarjetas (cards) apiladas verticalmente.

### 3. Next.js Image Optimization
- **Componente `<Image>`**: Queda estrictamente prohibido usar la etiqueta HTML nativa `<img>` para cargar imágenes de usuario u optimizables. Usa el componente `<Image>` de `next/image`.
- **Avatares de Usuario (Google OAuth)**: Los avatares remotos de Google (`lh3.googleusercontent.com`) deben renderizarse utilizando `<Image>` de Next.js. Debes especificar siempre `width` y `height` o la propiedad `fill` para evitar Cumulative Layout Shift (CLS).
- **Patrones de Imagen Permitidos**: Los patrones remotos autorizados en `next.config.ts` son:
  - `lh3.googleusercontent.com` (Avatares de Google)
  - `placehold.co` (Placeholders de desarrollo)
  ```typescript
  import Image from "next/image";
  
  // Ejemplo de avatar de usuario optimizado
  <div className="relative h-10 w-10 overflow-hidden rounded-full">
    <Image 
      src={user.image || "/fallback-avatar.png"} 
      alt={user.name || "User Avatar"} 
      fill
      sizes="40px"
      className="object-cover"
      priority={false}
    />
  </div>
  ```