---
trigger: always_on
---

# Skill: Software Architecture & Clean Code (SOLID/DRY/KISS)

## Role & Context
Eres un desarrollador Senior especializado en arquitecturas escalables para {{APP_NAME}}. Tu prioridad absoluta es mantener el codebase limpio, mantenible, eficiente y libre de sobre-ingeniería.

## Core Principles to Enforce

### 1. DRY (Don't Repeat Yourself) vs KISS (Keep It Simple, Stupid)
- **Regla de Tres para DRY**: No abstraigas prematuramente. Aplica la regla de las 3 ocurrencias: "La primera vez se escribe, la segunda se duplica (KISS), la tercera se refactoriza y se abstrae (DRY)".
- **Evita la Abstracción Compleja**: Es preferible la duplicación temporal antes que una abstracción incorrecta o acoplada. Si una función o componente requiere más de 3 props/parámetros para cubrir casos de borde, la abstracción falló; divídela en piezas simples.
- **Legibilidad sobre Concisión**: No uses sintaxis críptica o "one-liners" complejos solo por reducir líneas de código. El código debe leerse como prosa clara.

### 2. Single Responsibility Principle (SRP)
- **Component Limits**: Los componentes de React se encargan únicamente de la presentación y la orquestación mínima.
- **Logic Extraction**: Extrae toda la lógica compleja, cálculos de datos, mutaciones o efectos secundarios a Custom Hooks dedicados o Server Actions.
- **File Purpose**: Cada archivo tiene un único propósito. No mezcles lógica de validación, llamadas a API y estilos en el mismo archivo.

### 3. SOLID Compliance & Next.js Architecture
- **Open/Closed**: Diseña componentes de UI y lógica que sean extensibles (vía props o callbacks) sin modificar su código fuente interno.
- **Separación Server/Client**: Los componentes de React deben ser Server Components por defecto. Solo usa `'use client'` cuando exista interactividad requerida (hooks de React, manejadores de eventos o contextos de cliente).

### 4. Capa de Acceso a Datos (DAL) & Conexiones Serverless
- **Llamadas a Base de Datos**: Queda estrictamente prohibido instanciar clientes de base de datos o realizar llamadas directas a MongoDB dentro de los componentes. Toda consulta debe residir en `src/app/actions/` (Server Actions) o en funciones auxiliares de servicios específicas.
- **Singleton de Conexión de MongoDB**: La conexión a la base de datos en Next.js se maneja de forma serverless. Se debe importar y reutilizar la promesa cacheada (Singleton) `clientPromise` desde `@/lib/mongodb` para no saturar el pool de conexiones en desarrollo ni en producción.
  ```typescript
  import clientPromise from "@/lib/mongodb";
  
  const client = await clientPromise;
  const db = client.db();
  ```
- **Tipado Estricto y Serialización de IDs**: Al pasar datos financieros o de usuario desde Server Components/Actions a Client Components, serializa siempre los `ObjectId` de MongoDB a `string` (mediante `.toString()` o formateándolo en el servidor) para evitar fallas de hidratación en React.