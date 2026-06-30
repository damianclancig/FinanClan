# FinanClan: Sistema de Gestion de Finanzas Personales

FinanClan es una aplicacion web progresiva (PWA) de arquitectura moderna disenada para la administracion y el control riguroso de ingresos y gastos personales. La plataforma provee un panel de analisis predictivo, gestion eficiente de datos financieros y una integracion de carga rapida mediante la API de Telegram.

## Caracteristicas Principales

- Gestion Completa de Transacciones: Sistema de altas, bajas y modificaciones (CRUD) para registros de ingresos y egresos.
- Ciclos de Facturacion Personalizados: Segmentacion de periodos financieros adaptables a las particularidades del flujo de caja del usuario (ej. ciclos salariales).
- Fondos de Ahorro: Creacion y actualizacion de multiples objetivos de ahorro con visualizaciones enfocadas en el grado de progreso.
- Gestion de Pasivos y Cuotas: Administracion orientada a las compras en modalidad de cuotas, con rastreo del saldo adeudado proyectado al mes en curso.
- Control de Impuestos y Servicios: Panel recurrente para seguimiento y cancelacion historica de servicios facturados, identificando variaciones a traves del tiempo.
- Integracion de Procesamiento de Lenguaje Natural (NLP) via Telegram: Vinculacion segura de cuentas para el registro de transacciones directamente mediante interacciones textuales.
- Categorias y Metodos de Pago Dinamicos: Personalizacion de identificadores de gasto y fuentes de fondos con estados logicos configurables.
- Dashboard Analitico: Panel agregador que proporciona ratios de liquidez, graficos de distribucion de gastos por categoria y modelos de proyeccion lineal.
- Experiencia de Usuario Funcional: Entorno de interfaz implementando componentes visuales modernos, temas claro/oscuro rigurosos y retencion inteligente de estado y scroll en un formato "mobile-first".
- Sistema Multilenguaje (i18n): Soporte base para la Internacionalizacion con los idiomas Espanol (es), Ingles (en) y Portugues (pt).
- Autenticacion Descentralizada: Proteccion de rutas y gestion de sesiones basada en NextAuth con el proveedor de identidades de Google u otros autorizadores robustos.

---

## Pila Tecnologica

El proyecto opera sobre una base orientada a la velocidad de respuesta, aprovechando Server Components y rendering hibrido.

- Core Framework: Next.js (v16.2.3)
- Lenguaje de Desarrollo: TypeScript (v6)
- Estilizado de Interfaz: Tailwind CSS (v3.4.19)
- Componentes UI Primitivos: Radix UI
- Componentes UI Pre-empaquetados: ShadCN UI
- Libreria de Visualizacion de Datos: Recharts (v3.8.1)
- Persistencia de Datos y Modelo: MongoDB (v7.1.1)
- Sistema Integral de Autenticacion: NextAuth / Auth.js (v5.0.0-beta.30)
- Estandarizacion Temporal: date-fns (v4.1.0)
- Suite de Testing y Cobertura: Vitest (v4.1.4)
- Analiticas de Red y Performance: Vercel Analytics (v2.0.1) & Speed Insights (v2.0.0)

---

## Despliegue en Produccion

La aplicacion mantiene una version desplegada en produccion de continua integracion y despliegue lista para su uso:

Acceso a la plataforma: [https://caja.clancig.com.ar](https://caja.clancig.com.ar)

---

## Instrucciones de Instalacion y Ejecucion Local

Las siguientes directivas permitiran instanciar un ambiente de desarrollo consistente con el entorno de produccion.

### Dependencias Previas

- Entorno de ejecucion Node.js (v18 o superior)
- Sistema de control de versiones Git
- Cuenta de Google Cloud Platform habilitada para el aprovisionamiento de credenciales OAuth 2.0
- Acceso a un cluster de MongoDB Atlas (o instancia local)

### 1. Obtencion del Codigo Fuente

Ejecutar en linea de comandos para descargar la base de codigo:

```bash
git clone https://github.com/damianclancig/financlan.git
cd financlan
```

### 2. Instalacion de Modulos

Procesar el arbol de dependencias mediante el gestor predeterminado:

```bash
npm install
```

### 3. Configuracion de Variables de Entorno

Copiar el archivo base de variables y parametrizar los secretos de los servicios dependientes. Consultar el archivo `.env.local.example` para revisar todas las identificaciones requeridas. Se debera crear un archivo de nombre `.env.local` en la raiz del arbol de directorios definiendo las siguientes agrupaciones de configuraciones:

a. Parametrizacion de Auth.js
La base de URLs, referencias de seguridad provistas y credenciales OAuth facilitadas por el ecosistema de Google.

b. Acceso a MongoDB
La cadena de conexion y el identificador de la coleccion y base de datos para la instanciacion correcta.

c. Configuracion General y Referencias de Navegacion
Las URLs necesarias que conforman la metadata de la plataforma y direccionamiento estandar.

d. Telegram Bot Integration (Opcional)
En caso de habilitar la funcion de procesamiento de texto estructurado y flujos vinculados al bot conversacional de Telegram, se ingresaran tokens definidos en el entorno perimetral en uso de BotFather y una llave de registro de modelo Gemini LLM.

### 4. Inicializacion del Entorno Local

Ejecutar el comando provisto por los scripts NPM para levantar el servidor emulador:

```bash
npm run dev
```

La plataforma generara una ejecucion emitiendo respuestas por peticiones servidas e integrando Hot Reload en el puerto local de Next.js (predeterminado generalmente a `:3000` o `:9003`).

---
Sistema desarrollado priorizando legibilidad, aislamiento y arquitectura escalable bajo principios DRY/SRP.
