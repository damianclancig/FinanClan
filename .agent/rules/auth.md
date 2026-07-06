---
trigger: always_on
---

# Skill: Secure Authentication & Session Management (NextAuth / OAuth)

## Context
El sistema utiliza Google OAuth vía Auth.js (NextAuth v5) para la gestión de identidad en {{APP_NAME}}. La seguridad y la experiencia de usuario dependen de una verificación eficiente y unificada.

## Core Rules

### 1. Server-Side Session Fetching
- **Server Components, Server Actions & Route Handlers**: Obtén la sesión de forma asíncrona usando la función `auth()` importada de `@/auth`.
  ```typescript
  import { auth } from "@/auth";
  
  const session = await auth();
  const userId = session?.user?.id;
  ```
- **Middleware**: La protección de rutas privadas debe realizarse a nivel de `middleware.ts` para interceptar peticiones antes de renderizar la UI, evitando redirecciones tardías en el cliente.

### 2. Client-Side Session Fetching
- **Client Components**: Queda prohibido usar `useSession()` de `next-auth/react` de forma directa para lógica de negocio. Debe usarse siempre el hook personalizado `useAuth` importado desde `@/contexts/AuthContext`.
  ```typescript
  import { useAuth } from "@/contexts/AuthContext";
  
  const { user, dbUser, loading, signInWithGoogle, signOut } = useAuth();
  ```
  - `user`: Datos básicos provenientes de la sesión OAuth de Google.
  - `dbUser`: El documento del usuario sincronizado en la base de datos de MongoDB.

### 3. Token & Payload Minimization
- **Session Payload**: No almacenes objetos complejos de la base de datos en la sesión de la cookie. El payload de la sesión solo debe contener el `id` (UUID o legacy ID) del usuario de la base de datos y sus datos básicos (`email`, `name`, `image`).
- **Sincronización de Usuarios**: Al autenticar con Google OAuth, la lógica del callback `signIn` y `jwt` en `@/auth` debe sincronizar el usuario en MongoDB llamando a `syncGoogleUser` para asegurar que el registro exista e inicialice correctamente.