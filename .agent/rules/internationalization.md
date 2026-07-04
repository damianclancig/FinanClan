---
trigger: always_on
---

# Skill: Internationalization & Localization (i18n)

## Context
{{APP_NAME}} es una aplicación multiidioma que soporta Español (`es`), Inglés (`en`) y Portugués (`pt`). Es crítico que ningún texto visible para el usuario esté escrito directamente en el código.

## Core Rules

### 1. No Hardcoded Strings
- Queda estrictamente prohibido escribir texto plano en JSX/TSX.
- **Acción**: Todo texto debe ser obtenido desde el hook de internacionalización de la aplicación utilizando las traducciones de `en.json`, `es.json` y `pt.json`.

### 2. Sintaxis del Hook de Traducción (`LanguageContext`)
- **Importación**: Para consumir las traducciones, debes usar exclusivamente el hook `useTranslations` importado de `@/contexts/LanguageContext`. No intentes importar `react-i18next` o `next-intl`.
  ```typescript
  import { useTranslations } from "@/contexts/LanguageContext";
  ```
- **Uso Estándar**:
  ```typescript
  const { 
    translations, 
    language, 
    translateCategory, 
    translatePaymentType, 
    translateMonth 
  } = useTranslations();
  
  // Ejemplos de renderizado
  return (
    <div>
      <h1>{translations.welcomeMessage}</h1>
      <p>{translateCategory(category)}</p>
      <span>{translateMonth(monthIndex)}</span>
    </div>
  );
  ```
- **Propiedades Retornadas por `useTranslations`**:
  - `translations`: Objeto con el diccionario completo mapeado al idioma actual (`translations.key`).
  - `language`: Idioma activo actualmente (`'es' | 'en' | 'pt'`).
  - `translateCategory(category)`: Traduce nombres de categorías (si es una categoría del sistema, busca su traducción; si es personalizada, devuelve el nombre).
  - `translatePaymentType(paymentType)`: Traduce métodos de pago.
  - `translateMonth(monthIndex)`: Traduce el nombre del mes a partir de su índice (0 a 11).

### 3. Sincronización de Claves
- Al añadir o modificar textos de traducción en la interfaz:
  1. Identifica o define una key descriptiva en camelCase en los archivos locales.
  2. Modifica simultáneamente los tres archivos en `src/locales/` (`es.json`, `en.json`, `pt.json`).
  3. Si no conoces la traducción en algún idioma, añade el placeholder comentando `// TODO: Review translation` al nivel del commit o PR, pero no dejes claves vacías ni ausentes en los archivos de traducción.