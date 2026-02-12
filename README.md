# 🌌 OrbiApp

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**OrbiApp** es una plataforma de gestión personal y familiar de última generación, diseñada con un enfoque prioritario en la experiencia móvil (*Mobile-First*) y una estética premium que redefine la productividad cotidiana.

---

## ✨ Características Principales

OrbiApp no es solo un gestor de tareas; es tu centro de mando personal.

- 📱 **Experiencia Nativa en Web**: Interfaz optimizada para dispositivos móviles con gestos intuitivos.
- ⚡ **Captura Rápida (Quick Capture)**: Registra ideas, tareas o eventos al instante con `⌘K` o el botón flotante (FAB).
- 🔄 **Gestos Avanzados**: 
    - **Swipe-to-Delete**: Desliza hacia la izquierda para eliminar ítems rápidamente.
    - **Pull-to-Refresh**: Desliza hacia abajo para refrescar tus datos al instante.
    - **Long-Press**: Mantén presionado cualquier elemento para abrir el menú de acciones avanzadas.
- 📊 **Seguimiento de Proyectos**: Visualiza el progreso de tus metas con barras de progreso inteligentes y desglose de subtareas.
- 🛒 **Lista de Compras Inteligente**: Organizada por categorías y con cálculo automático de costos.
- 📅 **Agenda Centralizada**: Vista de calendario para no perder de vista tus eventos próximos.
- 🔒 **Privacidad y Compartición**: Alterna fácilmente entre ítems personales y compartidos con tu círculo familiar.

---

## 🎨 Sistema de Diseño

OrbiApp utiliza un lenguaje visual moderno basado en **Glassmorphism** y una paleta de colores vibrante.

### 🌈 Colores
| Uso | Color (OKLCH) | Muestra |
| :--- | :--- | :--- |
| **Primario** | `oklch(0.55 0.19 260)` | 🟦 _Vibrant Blue_ |
| **Fondo (Dark)** | `oklch(0.13 0.01 260)` | ⬛ _Deep Space_ |
| **Acento** | `oklch(0.65 0.22 310)` | 🟪 _Electric Purple_ |
| **Éxito** | `oklch(0.68 0.18 160)` | 🟩 _Emerald_ |

### 🎞️ Tipografía y Efectos
- **Fuente**: Geist Sans (Moderna, limpia y altamente legible).
- **Efectos**: Desenfoque de fondo dinámico (Blur), gradientes animados y micro-interacciones suaves.

---

## 🛠️ Stack Tecnológico

| Tecnología | Propósito |
| :--- | :--- |
| **Next.js 15+** | Framework de React para el frontend y backend (Server Actions). |
| **Prisma ORM** | Gestión de base de datos robusta y tipada. |
| **SQLite** | Base de datos ligera y eficiente para persistencia local. |
| **Tailwind CSS 4** | Estilizado moderno con el nuevo motor de compilación. |
| **Lucide React** | Pack de iconos vectoriales elegantes. |
| **Sonner** | Notificaciones tipo "toast" nativas y fluidas. |

---

## 🚀 Instalación y Desarrollo

Sigue estos pasos para levantar tu propia instancia de OrbiApp:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/danielvasquez507/OrbiApp.git
   cd OrbiApp/app
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura la base de datos:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Accede a la app:**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador. 
   _Tip: Abre las herramientas de desarrollador y activa la vista móvil para la mejor experiencia._

---

## 📱 Vista Previa (Mockup)

> [!TIP]
> OrbiApp se comporta como una PWA. Puedes añadirla a tu pantalla de inicio en iOS o Android para una experiencia 100% inmersiva.

| Dashboard Principal | Lista de Compras | Gestión de Proyectos |
| :---: | :---: | :---: |
| ✨ | 🛒 | 📈 |
| _Interfaz Fluida_ | _Categorización Automática_ | _Control de Progreso_ |

---

## 🤝 Contribuciones

¿Tienes una idea para mejorar OrbiApp? ¡Las contribuciones son bienvenidas!
1. Haz un Fork del proyecto.
2. Crea tu rama de función (`git checkout -b feature/NuevaMejora`).
3. Haz un commit de tus cambios (`git commit -m 'Añade nueva funcionalidad'`).
4. Haz un Push a la rama (`git push origin feature/NuevaMejora`).
5. Abre un Pull Request.

---

Desarrollado con ❤️ para un mundo más organizado.
