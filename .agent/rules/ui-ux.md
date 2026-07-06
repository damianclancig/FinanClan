---
trigger: always_on
---

# Skill: Dual Theme UI/UX (Light & Dark Mode)

## Context
{{APP_NAME}} utiliza un sistema de temas dual adaptable dinámicamente a la preferencia del usuario o del sistema.

## Core Rules for UI Generation

### 1. Theme Consistency (Tailwind / CSS Variables)
- **Use Semantic Tokens**: No hardcodees colores estáticos absolutos como `bg-white` o `text-black`. Usa clases de utilidad semánticas del tema o variables CSS (ej. `bg-primary`, `text-main`).
- **Dark Variant First**: Siempre que generes un componente, incluye explícitamente la variante oscura usando el prefijo `dark:`.
- **Contrast Check**: 
  - En **Light Mode**: Asegúrate de que el texto cumpla con los ratios de contraste sobre fondos claros.
  - En **Dark Mode**: Prioriza fondos negros puros o grises profundos con texto en blanco roto o gris tenue para reducir la fatiga visual. Usa bordes sutiles en lugar de sombras pesadas para separar elementos.